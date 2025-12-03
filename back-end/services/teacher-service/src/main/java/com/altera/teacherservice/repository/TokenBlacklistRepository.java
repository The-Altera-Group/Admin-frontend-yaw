package com.altera.teacherservice.repository;

import com.altera.teacherservice.entity.TokenBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TokenBlacklistRepository extends JpaRepository<TokenBlacklist, UUID> {
    
    Optional<TokenBlacklist> findByToken(String token);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM TokenBlacklist t WHERE t.expiresAt < :now")
    void deleteExpiredTokens(Instant now);
    
    default boolean isTokenBlacklisted(String token) {
        return findByToken(token).isPresent();
    }
}
