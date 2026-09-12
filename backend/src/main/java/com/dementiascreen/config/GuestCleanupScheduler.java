package com.dementiascreen.config;

import com.dementiascreen.entity.User;
import com.dementiascreen.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Periodically removes expired temporary guest accounts and cascades their
 * data (persons, screenings, results, history, follow-ups) via ON DELETE
 * CASCADE. Guest data lives only for the session lifetime (max 24h).
 */
@Component
public class GuestCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(GuestCleanupScheduler.class);

    private final UserRepository userRepository;

    public GuestCleanupScheduler(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Scheduled(fixedRate = 60 * 60 * 1000) // every hour
    @Transactional
    public void cleanupExpiredGuestAccounts() {
        LocalDateTime now = LocalDateTime.now();
        List<User> expired = userRepository.findByIsTemporaryTrueAndExpiresAtBefore(now);
        if (!expired.isEmpty()) {
            userRepository.deleteAll(expired);
            log.info("Cleaned up {} expired temporary guest account(s)", expired.size());
        }
    }
}
