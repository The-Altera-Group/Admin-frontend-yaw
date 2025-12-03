package com.altera.teacherservice.repository;

import com.altera.teacherservice.entity.PasswordResetToken;
import com.altera.teacherservice.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    
    Optional<PasswordResetToken> findByToken(String token);
    
    Optional<PasswordResetToken> findByTeacherAndUsed(Teacher teacher, boolean used);
    
    @Modifying
    @Transactional
    @Query("UPDATE PasswordResetToken t SET t.used = true WHERE t.teacher = :teacher AND t.used = false")
    void invalidateExistingTokens(@Param("teacher") Teacher teacher);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM PasswordResetToken t WHERE t.expiryDate < :date")
    void deleteExpiredTokens(@Param("date") LocalDateTime date);
}
