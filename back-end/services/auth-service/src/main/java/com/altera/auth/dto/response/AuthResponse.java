package com.altera.auth.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Data Transfer Object for authentication responses.
 * Contains tokens and user information returned after successful authentication.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    /**
     * JWT access token for authenticating subsequent requests.
     */
    private String accessToken;
    
    /**
     * Refresh token used to obtain a new access token when it expires.
     */
    private String refreshToken;
    
    /**
     * The type of token, defaults to "Bearer".
     */
    private String tokenType = "Bearer";
    
    /**
     * The number of seconds until the access token expires.
     */
    private Long expiresIn;
    
    /**
     * The authenticated user's role.
     */
    private String role;
    
    /**
     * The authenticated user's email address.
     */
    private String email;
    
    /**
     * Optional message providing additional information about the authentication result.
     */
    private String message;
    
    /**
     * The timestamp when the authentication response was created.
     */
    private Instant timestamp;

    /**
     * Factory method to create a successful authentication response.
     *
     * @param accessToken  The JWT access token
     * @param refreshToken The refresh token
     * @param role         The authenticated user's role
     * @param email        The authenticated user's email
     * @param expiresIn    The number of seconds until the access token expires
     * @return A new AuthResponse instance with success status
     */
    public static AuthResponse success(String accessToken, String refreshToken, String role, String email, Long expiresIn) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .role(role)
                .email(email)
                .expiresIn(expiresIn)
                .timestamp(Instant.now())
                .build();
    }

    /**
     * Factory method to create an error authentication response.
     *
     * @param message The error message describing the authentication failure
     * @return A new AuthResponse instance with error status and message
     */
    public static AuthResponse error(String message) {
        return AuthResponse.builder()
                .message(message)
                .timestamp(Instant.now())
                .build();
    }
}
