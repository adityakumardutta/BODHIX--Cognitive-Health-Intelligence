package com.dementiascreen.service;

import com.dementiascreen.dto.FirebaseAuthRequest;
import com.dementiascreen.dto.GoogleAuthRequest;
import com.dementiascreen.dto.LoginRequest;
import com.dementiascreen.dto.LoginResponse;
import com.dementiascreen.dto.ProfileRequest;
import com.dementiascreen.dto.ProfileResponse;
import com.dementiascreen.entity.User;
import com.dementiascreen.exception.BadRequestException;
import com.dementiascreen.exception.UnauthorizedException;
import com.dementiascreen.repository.UserRepository;
import com.dementiascreen.security.FirebaseTokenVerifier;
import com.dementiascreen.security.JwtService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private static final Logger securityLog = LoggerFactory.getLogger(AuthService.class);

    // ---- Brute-force protection (in-memory, per email+IP) ----
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final long LOCK_WINDOW_MINUTES = 10;
    private final Map<String, LoginAttempt> loginAttempts = new ConcurrentHashMap<>();

    private static final class LoginAttempt {
        volatile int count;
        volatile LocalDateTime lastFailure = LocalDateTime.now();
    }

    /** Security-relevant event logging — never logs passwords or tokens. */
    void logSecurityEvent(String event, String email) {
        String domain = email != null && email.contains("@")
                ? email.substring(email.indexOf('@')) : "unknown";
        securityLog.warn("{} (email domain: {}, ip: {})", event, domain, clientIp());
    }

    private String clientIp() {
        var attrs = RequestContextHolder.getRequestAttributes();
        if (attrs instanceof ServletRequestAttributes sra) {
            String xff = sra.getRequest().getHeader("X-Forwarded-For");
            if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
            return sra.getRequest().getRemoteAddr();
        }
        return "unknown";
    }

    private void recordLoginFailure(String email) {
        String key = email + "|" + clientIp();
        LoginAttempt attempt = loginAttempts.computeIfAbsent(key, k -> new LoginAttempt());
        synchronized (attempt) {
            attempt.count++;
            attempt.lastFailure = LocalDateTime.now();
        }
    }

    private void enforceLoginLock(String email) {
        String key = email + "|" + clientIp();
        LoginAttempt attempt = loginAttempts.get(key);
        if (attempt == null) return;
        synchronized (attempt) {
            if (attempt.count >= MAX_LOGIN_ATTEMPTS
                    && attempt.lastFailure.isAfter(LocalDateTime.now().minusMinutes(LOCK_WINDOW_MINUTES))) {
                logSecurityEvent("Login temporarily locked after repeated failed attempts", email);
                throw new UnauthorizedException("Too many failed login attempts. Please try again in a few minutes.");
            }
        }
    }

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

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService,
                       FirebaseTokenVerifier firebaseTokenVerifier) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.firebaseTokenVerifier = firebaseTokenVerifier;
    }

    private final FirebaseTokenVerifier firebaseTokenVerifier;

    /**
     * Firebase Google sign-in. Verifies the Firebase ID token server-side
     * (signature, expiry, issuer/audience), reads the trusted Google identity
     * from the verified claims only, then finds or safely links the existing
     * BODHIX user and issues the normal application JWT.
     *
     * The supplied name is PROFILE INFORMATION ONLY. Role and authorization
     * always come from the server-side user record — never from the request.
     */
    public LoginResponse firebaseLogin(FirebaseAuthRequest request) {
        FirebaseTokenVerifier.VerifiedIdentity identity;
        try {
            identity = firebaseTokenVerifier.verify(request.getIdToken());
        } catch (io.jsonwebtoken.JwtException e) {
            logSecurityEvent("Rejected invalid/expired Firebase ID token", null);
            throw new UnauthorizedException("Google authentication failed");
        }

        // Find the existing BODHIX account by verified email, or create one
        // with a random unusable password (Google users authenticate via Google).
        User user = userRepository.findByEmailIgnoreCase(identity.email())
                .or(() -> userRepository.findByEmail(identity.email()))
                .orElseGet(() -> userRepository.save(User.builder()
                        .email(identity.email())
                        .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .fullName("")
                        .role(User.Role.HEALTH_WORKER)
                        .isActive(true)
                        .build()));

        if (user.getIsActive() != null && !user.getIsActive()) {
            throw new UnauthorizedException("This account has been deactivated");
        }

        // Profile name handling: the entered doctor/specialist name is stored
        // on the existing profile. Never overwrites an existing non-blank name
        // with empty input; role is untouched.
        String suppliedName = request.getName() != null ? request.getName().trim() : "";
        if (!suppliedName.isEmpty()
                && (user.getFullName() == null || user.getFullName().isBlank())) {
            user.setFullName(suppliedName);
            user = userRepository.save(user);
        }

        String token = jwtService.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        return new LoginResponse(token, user.getId(), user.getFullName(), user.getEmail(),
                user.getRole().name(), isProfileComplete(user));
    }

    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : "";
        enforceLoginLock(email);

        User user = userRepository.findByEmailIgnoreCase(email)
                .or(() -> userRepository.findByEmail(email))
                .orElse(null);

        if (user == null) {
            recordLoginFailure(email);
            logSecurityEvent("Failed authentication attempt", email);
            // Uniform message: does not reveal whether the account exists.
            throw new UnauthorizedException("Invalid email or password");
        }

        String rawPassword = request.getPassword();
        boolean passwordMatches = passwordEncoder.matches(rawPassword, user.getPasswordHash())
                || (rawPassword != null && passwordEncoder.matches(rawPassword.trim(), user.getPasswordHash()));

        if (!passwordMatches) {
            recordLoginFailure(email);
            logSecurityEvent("Failed authentication attempt", email);
            throw new UnauthorizedException("Invalid email or password");
        }

        if (user.getIsActive() != null && !user.getIsActive()) {
            recordLoginFailure(email);
            logSecurityEvent("Authentication attempt for deactivated account", email);
            // Uniform message: does not reveal account state.
            throw new UnauthorizedException("Invalid email or password");
        }

        // Successful login clears the attempt counter.
        loginAttempts.remove(email + "|" + clientIp());

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