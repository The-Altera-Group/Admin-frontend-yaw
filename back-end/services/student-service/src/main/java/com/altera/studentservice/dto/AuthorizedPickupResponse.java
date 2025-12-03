package com.altera.studentservice.dto;

public record AuthorizedPickupResponse(
        String name,
        String contactNumber,
        String address,
        String relationship
) {
}
