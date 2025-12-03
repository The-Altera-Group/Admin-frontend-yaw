package com.altera.teacherservice.service;

import com.altera.teacherservice.dto.AuthRequest;
import com.altera.teacherservice.dto.AuthResponse;
import com.altera.teacherservice.dto.PasswordResetRequest;
import com.altera.teacherservice.dto.RefreshTokenRequest;
import com.altera.teacherservice.entity.PasswordResetToken;
import com.altera.teacherservice.entity.Teacher;
import com.altera.teacherservice.exception.InvalidTokenException;
import com.altera.teacherservice.exception.ResourceNotFoundException;
import com.altera.teacherservice.repository.PasswordResetTokenRepository;
import com.altera.teacherservice.repository.TeacherRepository;
import com.altera.teacherservice.security.CustomUserDetailsService;
import com.altera.teacherservice.security.JwtService;
import com.altera.teacherservice.dto.TeacherResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final TeacherRepository teacherRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final CustomUserDetailsService userDetailsService;

    public AuthResponse authenticate(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);
        
        Teacher teacher = teacherRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "email", request.getEmail()));
        
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .teacher(convertToDto(teacher))
                .build();
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        String userEmail = jwtService.extractUsername(refreshToken);
        
        if (userEmail != null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
            
            if (jwtService.isTokenValid(refreshToken, userDetails)) {
                String accessToken = jwtService.generateToken(userDetails);
                
                return AuthResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .build();
            }
        }
        
        throw new InvalidTokenException("Invalid refresh token");
    }

    public void requestPasswordReset(String email) {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "email", email));
        
        // Invalidate existing tokens
        passwordResetTokenRepository.invalidateExistingTokens(teacher);
        
        // Create new token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .teacher(teacher)
                .used(false)
                .build();
        
        passwordResetTokenRepository.save(resetToken);
        
        // Send email with reset link
        String resetLink = String.format("%s/reset-password?token=%s", 
                System.getenv().getOrDefault("FRONTEND_URL", "http://localhost:3000"),
                token);
        
        emailService.sendPasswordResetEmail(teacher.getEmail(), teacher.getFirstName(), resetLink);
    }

    @Transactional
    public void resetPassword(PasswordResetRequest request) {
        PasswordResetToken token = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired token"));
        
        if (token.isUsed() || token.isExpired()) {
            throw new InvalidTokenException("Token has already been used or has expired");
        }
        
        Teacher teacher = token.getTeacher();
        teacher.setPassword(passwordEncoder.encode(request.getNewPassword()));
        token.setUsed(true);
        
        teacherRepository.save(teacher);
        passwordResetTokenRepository.save(token);
    }

    private TeacherResponse convertToDto(Teacher teacher) {
        return TeacherResponse.builder()
                .id(teacher.getId())
                .employeeId(teacher.getEmployeeId())
                .title(teacher.getTitle())
                .firstName(teacher.getFirstName())
                .lastName(teacher.getLastName())
                .email(teacher.getEmail())
                .phoneNumber(teacher.getPhoneNumber())
                .address(teacher.getAddress())
                .city(teacher.getCity())
                .state(teacher.getState())
                .country(teacher.getCountry())
                .postalCode(teacher.getPostalCode())
                .isActive(teacher.isActive())
                .roles(teacher.getRoles())
                .createdAt(teacher.getCreatedAt())
                .updatedAt(teacher.getUpdatedAt())
                .build();
    }
}
