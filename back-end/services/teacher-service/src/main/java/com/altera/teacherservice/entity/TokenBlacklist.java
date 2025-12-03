package com.altera.teacherservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "token_blacklist")
public class TokenBlacklist {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false, unique = true, length = 1024)
    private String token;
    
    @Column(nullable = false)
    private Instant expiresAt;
    
    @Builder.Default
    @Column(nullable = false)
    private Instant blacklistedAt = Instant.now();
    
    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }
}
