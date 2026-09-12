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
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.transaction.annotation.Transactional;

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
     * Guest Login. Creates a NEW temporary guest user for EACH guest session,
     * so guest data is fully isolated between sessions and never shared.
     *
     * Each temporary guest account:
     *  - gets a unique session_id (UUID) and a unique email (unused, unguessable)
     *  - is marked is_temporary = true with an expires_at timestamp
     *  - receives the NORMAL backend JWT (same JwtService, same claims, same role)
     *  - has a random bcrypt password (never used, never exposed)
     *
     * A scheduled cleanup job removes expired temporary users and cascades
     * their data (persons, screenings, results, history, follow-ups) via
     * ON DELETE CASCADE. Guest data lives only for the session lifetime.
     *
     * No plaintext password exists in source code or configuration.
     */
    public LoginResponse guestLogin() {
        String sessionId = UUID.randomUUID().toString();
        String guestEmail = "guest-" + sessionId + "@temporary.bodhix";

        // Create an isolated temporary user for this guest session
        User guestUser = User.builder()
                .email(guestEmail)
                .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                .fullName("Guest")
                .role(User.Role.HEALTH_WORKER)
                .isActive(true)
                .isTemporary(true)
                .sessionId(sessionId)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();
        userRepository.save(guestUser);

        logSecurityEvent("Guest login (temporary session: " + sessionId + ")", guestEmail);
        String token = jwtService.generateToken(guestUser.getEmail(), guestUser.getId(), guestUser.getRole().name());
        // Guest display identity: name is exactly "Guest" and the session has
        // NO usable email address. The temporary account's email stays in the
        // database ONLY as the server-side identifier — it is never exposed to
        // the UI and never used as an email destination.
        return new LoginResponse(token, guestUser.getId(), "Guest", null,
                guestUser.getRole().name(), isProfileComplete(guestUser));

    }

    /**
     * Explicit Guest logout: deletes the temporary guest account and cascades
     * all its data (persons, screenings, results, history, follow-ups) via
     * ON DELETE CASCADE. Called when a Guest clicks "Logout" so their data
     * does not linger until the next hourly cleanup.
     *
     * No-op (returns safely) for non-guest users — normal doctors are never
     * deleted by this path.
     */
    @Transactional
    public void deleteCurrentSession(User user) {
        if (user == null || !Boolean.TRUE.equals(user.getIsTemporary())) {
            return;
        }
        logSecurityEvent("Guest session deleted on explicit logout", user.getEmail());
        userRepository.delete(user); // ON DELETE CASCADE removes all guest-owned data
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