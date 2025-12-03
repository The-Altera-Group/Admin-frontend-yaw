package com.altera.studentservice.dto;

public record AdditionalContactResponse(
        String name,
        String contactNumber,
        String address,
        String relationship
) {
}
