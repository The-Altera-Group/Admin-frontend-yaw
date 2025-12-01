package com.altera.studentservice.dto;

import jakarta.validation.constraints.NotBlank;

public record AdditionalContactRequest(
        @NotBlank String name,
        @NotBlank String contactNumber,
        String address,
        String relationship
) {
}
