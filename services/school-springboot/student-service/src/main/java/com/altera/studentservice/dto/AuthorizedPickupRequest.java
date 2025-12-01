package com.altera.studentservice.dto;

import jakarta.validation.constraints.NotBlank;

public record AuthorizedPickupRequest(
        @NotBlank String name,
        @NotBlank String contactNumber,
        String address,
        String relationship
) {
}
