package com.altera.studentservice.dto;

import com.altera.studentservice.model.Gender;
import com.altera.studentservice.model.LivesWith;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record StudentResponse(
        UUID id,
        String admissionNumber,
        String classAppliedFor,
        String classAdmittedTo,
        String previousSchool,
        String previousClass,
        String surname,
        String firstName,
        String middleNames,
        Gender gender,
        LocalDate dateOfBirth,
        String residentialAddress,
        String postalAddress,
        String hometown,
        String nationality,
        String religion,
        List<String> languagesSpoken,
        boolean immunized,
        boolean healthDocumentsSubmitted,
        LivesWith livesWith,
        String bloodGroup,
        Integer totalSiblings,
        Integer olderSiblings,
        Integer youngerSiblings,
        Integer otherChildrenInHouse,
        UUID primaryTeacherId,
        AdditionalContactResponse additionalContact,
        List<GuardianResponse> guardians,
        List<AuthorizedPickupResponse> authorizedPickups,
        List<UUID> classIds,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
