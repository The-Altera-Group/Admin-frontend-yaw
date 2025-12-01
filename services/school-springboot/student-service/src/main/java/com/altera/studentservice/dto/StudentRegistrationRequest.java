package com.altera.studentservice.dto;

import com.altera.studentservice.model.Gender;
import com.altera.studentservice.model.LivesWith;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record StudentRegistrationRequest(
        String admissionNumber,
        String classAppliedFor,
        String classAdmittedTo,
        String previousSchool,
        String previousClass,
        @NotBlank String surname,
        @NotBlank String firstName,
        String middleNames,
        @NotNull Gender gender,
        @NotNull @Past LocalDate dateOfBirth,
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
        @Valid AdditionalContactRequest additionalContact,
        @Valid List<GuardianRequest> guardians,
        @Valid List<AuthorizedPickupRequest> authorizedPickups
) {
}
