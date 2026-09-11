package com.dementiascreen.service;

import com.dementiascreen.entity.User;
import com.dementiascreen.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Periodic cleanup of expired temporary guest accounts.
 *
 * Each guest session creates a temporary user (see AuthService.guestLogin).
 * When the session expires, this job removes the user and cascades all
 * associated data (persons, screenings, results, history, follow-ups).
 *
 * Ensures guest data lives only for the session lifetime and is never
 * accessible by a subsequent guest session.
 */
@Service
public class GuestCleanupService {

    private static final Logger log = LoggerFactory.getLogger(GuestCleanupService.class);

    private final UserRepository userRepository;

    public GuestCleanupService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Runs every 15 minutes to remove expired temporary guest accounts.
     * The database's ON DELETE CASCADE handles all related data.
     */
    @Scheduled(fixedRate = 15 * 60 * 1000)
    @Transactional
    public void cleanupExpiredGuests() {
        try {
            LocalDateTime now = LocalDateTime.now();
            var expiredUsers = userRepository.findByIsTemporaryTrueAndExpiresAtBefore(now);
            if (!expiredUsers.isEmpty()) {
                userRepository.deleteAll(expiredUsers);
                log.info("Cleaned up {} expired temporary guest account(s)", expiredUsers.size());
            }
        } catch (Exception e) {
            log.warn("Guest cleanup job failed: {}", e.getMessage());
        }
    }
}

