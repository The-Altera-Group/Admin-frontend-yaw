package com.altera.auth.service;

import com.altera.auth.dto.request.ForgotPasswordRequest;
import com.altera.auth.dto.request.LoginRequest;
import com.altera.auth.dto.request.RegisterRequest;
import com.altera.auth.dto.request.ResetPasswordRequest;
import com.altera.auth.dto.response.AuthResponse;
import com.altera.auth.dto.response.MessageResponse;

public interface AuthService {

    AuthResponse authenticateUser(LoginRequest loginRequest);
    AuthResponse registerParent(RegisterRequest registerRequest);
    MessageResponse forgotPassword(ForgotPasswordRequest request);
    MessageResponse resetPassword(ResetPasswordRequest request);
    boolean validateToken(String token);
    AuthResponse refreshToken(String refreshToken);
}
