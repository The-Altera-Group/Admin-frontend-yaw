package com.altera.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Data Transfer Object for user login requests.
 * Contains the credentials required for user authentication.
 */
@Data
public class LoginRequest {
    /**
     * The email address of the user attempting to log in.
     * Must be a valid email format and cannot be blank.
     */
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    /**
     * The password for the user account.
     * Cannot be blank.
     */
    @NotBlank(message = "Password is required")
    private String password;
}
