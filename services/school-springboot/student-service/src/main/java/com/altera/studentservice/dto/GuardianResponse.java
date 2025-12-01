package com.altera.studentservice.dto;

import com.altera.studentservice.model.GuardianRole;

public record GuardianResponse(
        GuardianRole role,
        String surname,
        String firstName,
        String middleNames,
        String residentialAddress,
        String religion,
        String mobileNumber,
        String otherContact,
        String occupation,
        String companyName,
        String businessAddress,
        String emailAddress,
        String relationshipToPupil
) {
}
