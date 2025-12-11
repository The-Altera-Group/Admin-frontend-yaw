package com.altera.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Data Transfer Object for parent registration requests.
 * Contains all fields required for parent registration.
 */
@Data
public class RegisterRequest {

    /**
     * The parent's first name.
     * Cannot be blank.
     */
    @NotBlank(message = "First name is required")
    private String firstName;

    /**
     * The parent's last name.
     * Cannot be blank.
     */
    @NotBlank(message = "Last name is required")
    private String lastName;

    /**
     * The email address of the parent.
     * Must be a valid email format and cannot be blank.
     */
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    /**
     * The parent's contact phone number.
     * Must be a valid phone number format and cannot be blank.
     * Accepts international format with optional '+' prefix and various separators.
     */
    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^[+]?\\d{1,4}?[-.\\s]?\\d{3,15}$",
            message = "Phone number should be valid"
    )
    private String phoneNumber;

    /**
     * The password for the parent account.
     * Must be at least 8 characters long and contain:
     * - At least one digit
     * - At least one lowercase letter
     * - At least one uppercase letter
     * - At least one special character
     * - No whitespace
     */
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$",
            message = "Password must contain at least one digit, one lowercase letter, one uppercase letter, one special character, and no spaces"
    )
    private String password;
}
