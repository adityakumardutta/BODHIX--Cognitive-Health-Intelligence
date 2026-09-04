package com.dementiascreen.service;

import com.dementiascreen.dto.GoogleAuthRequest;
import com.dementiascreen.dto.LoginRequest;
import com.dementiascreen.dto.LoginResponse;
import com.dementiascreen.dto.ProfileRequest;
import com.dementiascreen.dto.ProfileResponse;
import com.dementiascreen.entity.User;
import com.dementiascreen.exception.BadRequestException;
import com.dementiascreen.exception.UnauthorizedException;
import com.dementiascreen.repository.UserRepository;
import com.dementiascreen.security.JwtService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Value("${app.google.client-id:}")
    private String googleClientId;

    @Value("${app.google.client-secret:}")
    private String googleClientSecret;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : "";
        User user = userRepository.findByEmailIgnoreCase(email)
                .or(() -> userRepository.findByEmail(email))
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (user.getIsActive() != null && !user.getIsActive()) {
            throw new UnauthorizedException("This account has been deactivated");
        }

        String rawPassword = request.getPassword();
        boolean passwordMatches = passwordEncoder.matches(rawPassword, user.getPasswordHash())
                || (rawPassword != null && passwordEncoder.matches(rawPassword.trim(), user.getPasswordHash()));

        if (!passwordMatches) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        return new LoginResponse(token, user.getId(), user.getFullName(), user.getEmail(),
                user.getRole().name(), isProfileComplete(user));
    }

    /**
     * Real Google OAuth 2.0 (Authorization Code) login. Exchanges the authorization
     * code with Google, reads the verified account email, then finds or creates the
     * local BODHIX user and issues the normal application JWT.
     */
    public LoginResponse googleLogin(GoogleAuthRequest request) {
        if (googleClientId == null || googleClientId.isBlank()
                || googleClientSecret == null || googleClientSecret.isBlank()) {
            throw new BadRequestException("Google login is not configured on this server");
        }

        // 1. Exchange the authorization code for tokens at Google's token endpoint.
        String form = "code=" + enc(request.getCode())
                + "&client_id=" + enc(googleClientId)
                + "&client_secret=" + enc(googleClientSecret)
                + "&redirect_uri=" + enc(request.getRedirectUri())
                + "&grant_type=authorization_code";

        String accessToken;
        try {
            HttpRequest tokenRequest = HttpRequest.newBuilder(URI.create("https://oauth2.googleapis.com/token"))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(form))
                    .build();
            HttpResponse<String> tokenResponse =
                    httpClient.send(tokenRequest, HttpResponse.BodyHandlers.ofString());
            if (tokenResponse.statusCode() != 200) {
                throw new UnauthorizedException("Google authentication failed");
            }
            accessToken = objectMapper.readTree(tokenResponse.body())
                    .path("access_token").asText(null);
        } catch (UnauthorizedException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Could not complete Google authentication");
        }
        if (accessToken == null || accessToken.isBlank()) {
            throw new UnauthorizedException("Google authentication failed");
        }

        // 2. Read the verified Google identity over TLS from the userinfo endpoint.
        String email;
        Boolean emailVerified;
        try {
            HttpRequest userinfoRequest = HttpRequest.newBuilder(
                            URI.create("https://www.googleapis.com/oauth2/v3/userinfo"))
                    .header("Authorization", "Bearer " + accessToken)
                    .GET()
                    .build();
            HttpResponse<String> userinfoResponse =
                    httpClient.send(userinfoRequest, HttpResponse.BodyHandlers.ofString());
            if (userinfoResponse.statusCode() != 200) {
                throw new UnauthorizedException("Google authentication failed");
            }
            JsonNode info = objectMapper.readTree(userinfoResponse.body());
            email = info.path("email").asText(null);
            emailVerified = info.path("email_verified").asBoolean(false);
        } catch (UnauthorizedException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Could not read the Google account profile");
        }

        if (email == null || email.isBlank() || !emailVerified) {
            throw new UnauthorizedException("The Google account email could not be verified");
        }

        // 3. Find or create the matching local BODHIX user (no fake users, no bypass).
        final String userEmail = email.trim();
        User user = userRepository.findByEmailIgnoreCase(userEmail)
                .or(() -> userRepository.findByEmail(userEmail))
                .orElseGet(() -> userRepository.save(User.builder()
                        .email(userEmail)
                        // Random unusable password: Google users authenticate via Google only.
                        .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .fullName("")
                        .role(User.Role.HEALTH_WORKER)
                        .isActive(true)
                        .build()));

        if (user.getIsActive() != null && !user.getIsActive()) {
            throw new UnauthorizedException("This account has been deactivated");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        return new LoginResponse(token, user.getId(), user.getFullName(), user.getEmail(),
                user.getRole().name(), isProfileComplete(user));
    }

    /** Saves specialist details (name required, specialization optional) on the authenticated user. */
    public ProfileResponse updateProfile(User user, ProfileRequest request) {
        String fullName = request.getFullName() != null ? request.getFullName().trim() : "";
        if (fullName.isEmpty()) {
            throw new BadRequestException("Specialist name is required");
        }
        user.setFullName(fullName);
        if (request.getSpecialization() != null && !request.getSpecialization().isBlank()) {
            user.setSpecialization(request.getSpecialization().trim());
        }
        User saved = userRepository.save(user);
        return new ProfileResponse(saved.getId(), saved.getFullName(), saved.getEmail(),
                saved.getRole().name(), saved.getSpecialization());
    }

    private boolean isProfileComplete(User user) {
        return user.getFullName() != null && !user.getFullName().isBlank();
    }

    private String enc(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}