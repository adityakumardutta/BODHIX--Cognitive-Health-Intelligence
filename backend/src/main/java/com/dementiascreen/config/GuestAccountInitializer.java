package com.dementiascreen.config;

import com.dementiascreen.entity.User;
import com.dementiascreen.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Guest account initializer (seed mechanism).
 *
 * Guarantees the dedicated guest account exists at startup so Guest Login can
 * authenticate against a real, stored user (no frontend mock, no hardcoded
 * token). The account:
 *  - has role HEALTH_WORKER (no admin privileges),
 *  - is active and profile-complete (full name "Guest"),
 *  - has a RANDOM unusable password (bcrypt-hashed) — guests authenticate via
 *    the /api/auth/guest endpoint, never via password; no plaintext password
 *    exists anywhere in source code or configuration.
 *
 * Idempotent: if the account already exists (e.g. seeded manually), it is
 * left exactly as it is.
 */
@Component
public class GuestAccountInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(GuestAccountInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.guest.email:guest@bodhix.demo}")
    private String guestEmail;

    public GuestAccountInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        String email = guestEmail != null ? guestEmail.trim() : "";
        if (email.isEmpty()) return;

        boolean exists = userRepository.findByEmailIgnoreCase(email).isPresent()
                || userRepository.findByEmail(email).isPresent();
        if (exists) return;

        userRepository.save(User.builder()
                .email(email)
                // Random unusable password, bcrypt-hashed with the SAME encoder
                // used for all users. Never logged, never sent to the frontend.
                .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                .fullName("Guest")
                .role(User.Role.HEALTH_WORKER)
                .isActive(true)
                .build());
        log.info("Created the dedicated guest account ({})", email);
    }
}
