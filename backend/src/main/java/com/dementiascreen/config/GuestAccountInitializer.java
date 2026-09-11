package com.dementiascreen.config;

import com.dementiascreen.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Guest account initializer — DISABLED.
 *
 * Guest login now creates a NEW isolated temporary user per session via
 * AuthService.guestLogin(). Each temporary guest account has a unique
 * session_id, is_temporary = true, and expires_at = now + 24h. The
 * GuestCleanupScheduler removes expired temporary accounts and cascades
 * their data via ON DELETE CASCADE.
 *
 * The old shared guest account (guest@bodhix.demo / worker1@dementiascreen.demo)
 * is intentionally NOT created here, because guest data must be isolated
 * per session and never shared between guest sessions.
 */
@Component
public class GuestAccountInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(GuestAccountInitializer.class);

    private final UserRepository userRepository;

    public GuestAccountInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        // No-op: temporary guest accounts are now created on demand by
        // AuthService.guestLogin() with full per-session isolation.
        log.info("GuestAccountInitializer: using per-session temporary guest accounts (no shared account created)");
    }
}
