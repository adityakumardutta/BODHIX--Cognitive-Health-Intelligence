package com.dementiascreen.service;

import com.dementiascreen.dto.LoginRequest;
import com.dementiascreen.dto.LoginResponse;
import com.dementiascreen.dto.ProfileRequest;
import com.dementiascreen.dto.ProfileResponse;
import com.dementiascreen.entity.User;
import com.dementiascreen.exception.BadRequestException;
import com.dementiascreen.exception.UnauthorizedException;
import com.dementiascreen.repository.UserRepository;
import com.dementiascreen.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.Map;
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

    /** Dedicated guest/demo account used by the Guest Login option (HEALTH_WORKER only). */
    @Value("${app.guest.email:worker1@dementiascreen.demo}")
    private String guestEmail;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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
     * Guest Login. Authenticates the dedicated guest/demo account
     * (email via app.guest.email / GUEST_EMAIL, defaulting to the seeded
     * worker1@dementiascreen.demo demo account) and issues the NORMAL
     * backend JWT — the same JwtService, same claims, same authorization
     * as any other login. No authentication is bypassed.
     *
     * Hard safety rules:
     *  - the guest account MUST have role HEALTH_WORKER (no admin takeover);
     *  - the account must be active;
     *  - no password is involved: the account password is only ever stored
     *    as a bcrypt hash (seed.sql) and is never exposed to the frontend.
     */
    public LoginResponse guestLogin() {
        String email = guestEmail != null ? guestEmail.trim() : "";
        User user = userRepository.findByEmailIgnoreCase(email)
                .or(() -> userRepository.findByEmail(email))
                .orElseThrow(() -> {
                    logSecurityEvent("Guest login attempted but guest account is missing", email);
                    return new UnauthorizedException("Guest access is not available on this server");
                });

        if (user.getRole() != User.Role.HEALTH_WORKER) {
            logSecurityEvent("Rejected guest login for non-HEALTH_WORKER account", user.getEmail());
            throw new UnauthorizedException("Guest access is not available on this server");
        }

        if (user.getIsActive() != null && !user.getIsActive()) {
            logSecurityEvent("Guest login attempted for deactivated account", user.getEmail());
            throw new UnauthorizedException("Guest access is not available on this server");
        }

        logSecurityEvent("Guest login", user.getEmail());
        String token = jwtService.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        // Guest display identity: name is exactly "Guest" and the session has
        // NO usable email address. The shared demo account's real email stays
        // in the database ONLY as the server-side identifier used to recognize
        // the guest (see ReportEmailService) — it is never exposed to the UI
        // and never used as an email destination.
        return new LoginResponse(token, user.getId(), "Guest", null,
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
}