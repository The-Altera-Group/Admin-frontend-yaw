package com.altera.auth.service;

import com.altera.auth.dto.request.ResetPasswordRequest;
import com.altera.auth.exception.ResourceNotFoundException;
import com.altera.auth.model.PasswordResetToken;
import com.altera.auth.model.User;
import com.altera.auth.repository.PasswordResetTokenRepository;
import com.altera.auth.repository.UserRepository;
import jakarta.ws.rs.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Transactional
    public void processForgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Delete any existing tokens for this user
        passwordResetTokenRepository.deleteByUser(user);

        // Create new token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user);
        passwordResetTokenRepository.save(resetToken);

        // Send email
        emailService.sendPasswordResetEmail(user.getEmail(), token, user.getUsername());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        // Validate token
        PasswordResetToken token = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired token"));

        // Check if token is expired
        if (token.isExpired()) {
            passwordResetTokenRepository.delete(token);
            throw new BadRequestException("Token has expired. Please request a new password reset.");
        }

        // Validate password match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        // Update user password
        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Send confirmation email
        emailService.sendPasswordResetConfirmationEmail(user.getEmail(), user.getUsername());

        // Delete the used token
        passwordResetTokenRepository.delete(token);
    }

    public boolean validateToken(String token) {
        return passwordResetTokenRepository.findByToken(token)
                .map(t -> !t.isExpired())
                .orElse(false);
    }
}
