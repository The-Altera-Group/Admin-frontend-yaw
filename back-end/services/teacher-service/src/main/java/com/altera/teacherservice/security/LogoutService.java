package com.altera.teacherservice.security;

import com.altera.teacherservice.repository.TokenBlacklistRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Date;
import java.time.Instant;
import com.altera.teacherservice.entity.TokenBlacklist;

@Service
@RequiredArgsConstructor
public class LogoutService implements LogoutHandler {

    private final TokenBlacklistRepository tokenBlacklistRepository;
    private final JwtService jwtService;

    @Override
    public void logout(HttpServletRequest request, 
                      HttpServletResponse response, 
                      Authentication authentication) {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        
        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
            return;
        }
        
        jwt = authHeader.substring(7);
        var storedToken = tokenBlacklistRepository.findByToken(jwt);
        
        if (storedToken.isPresent()) {
            return;
        }
        
        // Add token to blacklist
        Date expirationDate = jwtService.extractExpiration(jwt);
        Instant expiresAt = expirationDate != null ? expirationDate.toInstant() : 
            Instant.now().plusSeconds(3600); // Default to 1 hour if no expiration
            
        var blacklistedToken = TokenBlacklist.builder()
            .token(jwt)
            .expiresAt(expiresAt)
            .blacklistedAt(Instant.now())
            .build();
        
        tokenBlacklistRepository.save(blacklistedToken);
        SecurityContextHolder.clearContext();
    }
}
