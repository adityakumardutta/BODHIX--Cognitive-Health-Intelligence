package com.dementiascreen.repository;

import com.dementiascreen.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmail(String email);
    List<User> findByIsTemporaryTrueAndExpiresAtBefore(LocalDateTime now);

    @Modifying
    @Query("DELETE FROM User u WHERE u.isTemporary = true AND u.expiresAt < :now")
    int deleteExpiredTemporaryUsers(@Param("now") LocalDateTime now);
}