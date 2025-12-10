package com.altera.auth.service;

import com.altera.auth.dto.request.ForgotPasswordRequest;
import com.altera.auth.dto.request.LoginRequest;
import com.altera.auth.dto.request.RegisterRequest;
import com.altera.auth.dto.request.ResetPasswordRequest;
import com.altera.auth.dto.response.AuthResponse;
import com.altera.auth.dto.response.MessageResponse;
import com.altera.auth.exception.EmailAlreadyExistsException;
import com.altera.auth.model.Parent;
import com.altera.auth.model.User;
import com.altera.auth.repository.UserRepository;
import com.altera.auth.security.JwtTokenProvider;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final PasswordResetService passwordResetService;

    @Override
    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        passwordResetService.processForgotPassword(request.getEmail());
        return new MessageResponse("Password reset link has been sent to your email");
    }

    @Override
    @Transactional
    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(loginRequest.getEmail());
        
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + loginRequest.getEmail()));
        
        return AuthResponse.success(
                accessToken,
                refreshToken,
                user.getRole().name(),
                user.getEmail(),
                tokenProvider.getJwtExpirationInMs()
        );
    }


    @Override
    @Transactional
    public AuthResponse registerParent(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new EmailAlreadyExistsException("Email is already in use!");
        }

        Parent parent = new Parent();
        parent.setEmail(registerRequest.getEmail());
        parent.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        parent.setFirstName(registerRequest.getFirstName());
        parent.setLastName(registerRequest.getLastName());
        parent.setPhoneNumber(registerRequest.getPhoneNumber());
        parent.setEnabled(true);

        userRepository.save(parent);

        String accessToken = tokenProvider.generateTokenFromUsername(registerRequest.getEmail());
        String refreshToken = tokenProvider.generateRefreshToken(registerRequest.getEmail());

        return AuthResponse.success(
                accessToken,
                refreshToken,
                User.UserRole.PARENT.name(),
                parent.getEmail(),
                tokenProvider.getJwtExpirationInMs()
        );
    }



    @Override
    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        try {
            passwordResetService.resetPassword(request);
            return new MessageResponse("Password has been reset successfully");
        } catch (ResponseStatusException | BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "An error occurred while resetting the password");
        }
    }

    @Override
    public boolean validateToken(String token) {
        return false;
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        String email = tokenProvider.getUsernameFromToken(refreshToken);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        String newAccessToken = tokenProvider.generateTokenFromUsername(email);
        String newRefreshToken = tokenProvider.generateRefreshToken(email);
        
        return AuthResponse.success(
                newAccessToken,
                newRefreshToken,
                user.getRole().name(),
                user.getEmail(),
                tokenProvider.getJwtExpirationInMs()
        );
    }

    public void logout(String token) {
        SecurityContextHolder.clearContext();
        }
    }

