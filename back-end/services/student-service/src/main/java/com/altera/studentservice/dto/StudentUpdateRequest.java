package com.altera.studentservice.dto;

import com.altera.studentservice.model.Gender;
import com.altera.studentservice.model.LivesWith;
import jakarta.validation.Valid;
import com.altera.studentservice.dto.AdditionalContactRequest;
import com.altera.studentservice.dto.GuardianRequest;
import com.altera.studentservice.dto.AuthorizedPickupRequest;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record StudentUpdateRequest(
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
        Boolean immunized,
        Boolean healthDocumentsSubmitted,
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
    public boolean hasAdmissionNumber() { return admissionNumber != null; }
    public boolean hasClassAppliedFor() { return classAppliedFor != null; }
    public boolean hasClassAdmittedTo() { return classAdmittedTo != null; }
    public boolean hasPreviousSchool() { return previousSchool != null; }
    public boolean hasPreviousClass() { return previousClass != null; }
    public boolean hasSurname() { return surname != null; }
    public boolean hasFirstName() { return firstName != null; }
    public boolean hasMiddleNames() { return middleNames != null; }
    public boolean hasGender() { return gender != null; }
    public boolean hasDateOfBirth() { return dateOfBirth != null; }
    public boolean hasResidentialAddress() { return residentialAddress != null; }
    public boolean hasPostalAddress() { return postalAddress != null; }
    public boolean hasHometown() { return hometown != null; }
    public boolean hasNationality() { return nationality != null; }
    public boolean hasReligion() { return religion != null; }
    public boolean hasLanguagesSpoken() { return languagesSpoken != null; }
    public boolean hasImmunized() { return immunized != null; }
    public boolean hasHealthDocumentsSubmitted() { return healthDocumentsSubmitted != null; }
    public boolean hasLivesWith() { return livesWith != null; }
    public boolean hasBloodGroup() { return bloodGroup != null; }
    public boolean hasTotalSiblings() { return totalSiblings != null; }
    public boolean hasOlderSiblings() { return olderSiblings != null; }
    public boolean hasYoungerSiblings() { return youngerSiblings != null; }
    public boolean hasOtherChildrenInHouse() { return otherChildrenInHouse != null; }
    public boolean hasPrimaryTeacherId() { return primaryTeacherId != null; }
    public boolean hasAdditionalContact() { return additionalContact != null; }
    public boolean hasGuardians() { return guardians != null; }
    public boolean hasAuthorizedPickups() { return authorizedPickups != null; }
}
