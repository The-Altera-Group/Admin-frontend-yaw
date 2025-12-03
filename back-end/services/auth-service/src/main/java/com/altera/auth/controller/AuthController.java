package com.altera.auth.controller;

import com.altera.auth.dto.request.LoginRequest;
import com.altera.auth.dto.request.RegisterRequest;
import com.altera.auth.dto.response.AuthResponse;
import com.altera.auth.service.AuthServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthServiceImpl authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.authenticateUser(loginRequest));
    }

    @PostMapping("/login/parent")
    public ResponseEntity<AuthResponse> loginParent(@Valid @RequestBody LoginRequest loginRequest) {
        // Additional parent-specific login logic can be added here
        return ResponseEntity.ok(authService.authenticateUser(loginRequest));
    }

    @PostMapping("/login/teacher")
    public ResponseEntity<AuthResponse> loginTeacher(@Valid @RequestBody LoginRequest loginRequest) {
        // Additional teacher-specific login logic can be added here
        return ResponseEntity.ok(authService.authenticateUser(loginRequest));
    }

    @PostMapping("/register/parent")
    public ResponseEntity<AuthResponse> registerParent(@Valid @RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.ok(authService.registerParent(registerRequest));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(@RequestHeader("Authorization") String refreshToken) {
        if (refreshToken != null && refreshToken.startsWith("Bearer ")) {
            refreshToken = refreshToken.substring(7);
        }
        return ResponseEntity.ok(authService.refreshToken(refreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        authService.logout(token);
        return ResponseEntity.ok().build();
    }
}
