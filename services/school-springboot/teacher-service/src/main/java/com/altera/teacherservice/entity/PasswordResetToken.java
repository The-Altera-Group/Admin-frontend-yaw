package com.altera.teacherservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "password_reset_tokens")
public class PasswordResetToken {
    
    private static final int EXPIRATION_HOURS = 24;
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false, unique = true)
    private String token;
    
    @OneToOne(targetEntity = Teacher.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "teacher_id")
    private Teacher teacher;
    
    @Column(nullable = false)
    private LocalDateTime expiryDate;
    
    @Column(nullable = false)
    private boolean used;
    
    @PrePersist
    public void setExpiryDate() {
        this.expiryDate = LocalDateTime.now().plusHours(EXPIRATION_HOURS);
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }
}
