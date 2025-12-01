package com.altera.studentservice.dto;

import com.altera.studentservice.model.GuardianRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GuardianRequest(
        @NotNull GuardianRole role,
        @NotBlank String surname,
        @NotBlank String firstName,
        String middleNames,
        String residentialAddress,
        String religion,
        @NotBlank String mobileNumber,
        String otherContact,
        String occupation,
        String companyName,
        String businessAddress,
        @Email String emailAddress,
        String relationshipToPupil
) {
}
