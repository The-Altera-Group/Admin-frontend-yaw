package com.altera.studentservice.service.impl;

import com.altera.studentservice.dto.AdditionalContactRequest;
import com.altera.studentservice.dto.AdditionalContactResponse;
import com.altera.studentservice.dto.AuthorizedPickupRequest;
import com.altera.studentservice.dto.AuthorizedPickupResponse;
import com.altera.studentservice.dto.GuardianRequest;
import com.altera.studentservice.dto.GuardianResponse;
import com.altera.studentservice.dto.StudentRegistrationRequest;
import com.altera.studentservice.dto.StudentResponse;
import com.altera.studentservice.dto.StudentUpdateRequest;
import com.altera.studentservice.entity.AdditionalContact;
import com.altera.studentservice.entity.Student;
import com.altera.studentservice.entity.StudentAuthorizedPickup;
import com.altera.studentservice.entity.StudentClassEnrollment;
import com.altera.studentservice.entity.StudentGuardian;
import com.altera.studentservice.model.GuardianRole;
import com.altera.studentservice.repository.StudentRepository;
import com.altera.studentservice.service.StudentService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;

    public StudentServiceImpl(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public StudentResponse createStudent(StudentRegistrationRequest request) {
        Student student = mapToEntity(new Student(), request);
        student.getGuardians().forEach(guardian -> guardian.setStudent(student));
        student.getAuthorizedPickups().forEach(pickup -> pickup.setStudent(student));
        Student saved = studentRepository.save(student);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponse getStudent(UUID studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));
        return mapToResponse(student);
    }

    @Override
    public StudentResponse updateStudent(UUID studentId, StudentRegistrationRequest request) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));
        student.getGuardians().clear();
        student.getAuthorizedPickups().clear();
        student.getClassEnrollments().clear();
        mapToEntity(student, request);
        student.getGuardians().forEach(guardian -> guardian.setStudent(student));
        student.getAuthorizedPickups().forEach(pickup -> pickup.setStudent(student));
        Student saved = studentRepository.save(student);
        return mapToResponse(saved);
    }

    @Override
    public StudentResponse patchStudent(UUID studentId, StudentUpdateRequest request) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));
        
        // Update only the fields that are present in the request
        if (request.hasAdmissionNumber()) student.setAdmissionNumber(request.admissionNumber());
        if (request.hasClassAppliedFor()) student.setClassAppliedFor(request.classAppliedFor());
        if (request.hasClassAdmittedTo()) student.setClassAdmittedTo(request.classAdmittedTo());
        if (request.hasPreviousSchool()) student.setPreviousSchool(request.previousSchool());
        if (request.hasPreviousClass()) student.setPreviousClass(request.previousClass());
        if (request.hasSurname()) student.setSurname(request.surname());
        if (request.hasFirstName()) student.setFirstName(request.firstName());
        if (request.hasMiddleNames()) student.setMiddleNames(request.middleNames());
        if (request.hasGender()) student.setGender(request.gender());
        if (request.hasDateOfBirth()) student.setDateOfBirth(request.dateOfBirth());
        if (request.hasResidentialAddress()) student.setResidentialAddress(request.residentialAddress());
        if (request.hasPostalAddress()) student.setPostalAddress(request.postalAddress());
        if (request.hasHometown()) student.setHometown(request.hometown());
        if (request.hasNationality()) student.setNationality(request.nationality());
        if (request.hasReligion()) student.setReligion(request.religion());
        if (request.hasLanguagesSpoken()) student.setLanguagesSpoken(request.languagesSpoken());
        if (request.hasImmunized()) student.setImmunized(request.immunized());
        if (request.hasHealthDocumentsSubmitted()) student.setHealthDocumentsSubmitted(request.healthDocumentsSubmitted());
        if (request.hasLivesWith()) student.setLivesWith(request.livesWith());
        if (request.hasBloodGroup()) student.setBloodGroup(request.bloodGroup());
        if (request.hasTotalSiblings()) student.setTotalSiblings(request.totalSiblings());
        if (request.hasOlderSiblings()) student.setOlderSiblings(request.olderSiblings());
        if (request.hasYoungerSiblings()) student.setYoungerSiblings(request.youngerSiblings());
        if (request.hasOtherChildrenInHouse()) student.setOtherChildrenInHouse(request.otherChildrenInHouse());
        if (request.hasPrimaryTeacherId()) student.setPrimaryTeacherId(request.primaryTeacherId());
        
        // Handle additional contact
        if (request.hasAdditionalContact() && request.additionalContact() != null) {
            if (student.getAdditionalContact() == null) {
                student.setAdditionalContact(new AdditionalContact());
            }
            AdditionalContact contact = student.getAdditionalContact();
            AdditionalContactRequest contactRequest = request.additionalContact();
            if (contactRequest.name() != null) contact.setName(contactRequest.name());
            if (contactRequest.contactNumber() != null) contact.setContactNumber(contactRequest.contactNumber());
            if (contactRequest.address() != null) contact.setAddress(contactRequest.address());
            if (contactRequest.relationship() != null) contact.setRelationship(contactRequest.relationship());
        }
        
        // Handle guardians
        if (request.hasGuardians() && request.guardians() != null) {
            // For simplicity, we'll replace all guardians
            // In a real app, you might want to implement more sophisticated merging
            student.getGuardians().clear();
            if (!request.guardians().isEmpty()) {
                student.setGuardians(mapGuardians(request.guardians(), student));
            }
        }
        
        // Handle authorized pickups
        if (request.hasAuthorizedPickups() && request.authorizedPickups() != null) {
            // Similar to guardians, we'll replace all authorized pickups
            student.getAuthorizedPickups().clear();
            if (!request.authorizedPickups().isEmpty()) {
                student.setAuthorizedPickups(mapAuthorizedPickups(request.authorizedPickups(), student));
            }
        }
        
        Student saved = studentRepository.save(student);
        return mapToResponse(saved);
    }
    
    @Override
    public void deleteStudent(UUID studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));
        studentRepository.delete(student);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponse> listStudents(String surname, String className) {
        // Simple implementation: fetch all and filter in memory, can be optimized later
        return studentRepository.findAll().stream()
                .filter(student -> surname == null || student.getSurname().equalsIgnoreCase(surname))
                .filter(student -> className == null || className.equalsIgnoreCase(student.getClassAdmittedTo()))
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<UUID> enrollStudentInClasses(UUID studentId, List<UUID> classIds) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));
        student.getClassEnrollments().clear();
        for (UUID classId : classIds) {
            StudentClassEnrollment enrollment = new StudentClassEnrollment();
            enrollment.setStudent(student);
            enrollment.setClassId(classId);
            enrollment.setEnrolledOn(LocalDate.now());
            student.getClassEnrollments().add(enrollment);
        }
        Student saved = studentRepository.save(student);
        return saved.getClassEnrollments().stream()
                .map(StudentClassEnrollment::getClassId)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UUID> getStudentClasses(UUID studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));
        return student.getClassEnrollments().stream()
                .map(StudentClassEnrollment::getClassId)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UUID getStudentPrimaryTeacher(UUID studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));
        return student.getPrimaryTeacherId();
    }

    private Student mapToEntity(Student student, StudentRegistrationRequest request) {
        student.setAdmissionNumber(request.admissionNumber());
        student.setClassAppliedFor(request.classAppliedFor());
        student.setClassAdmittedTo(request.classAdmittedTo());
        student.setPreviousSchool(request.previousSchool());
        student.setPreviousClass(request.previousClass());
        student.setSurname(request.surname());
        student.setFirstName(request.firstName());
        student.setMiddleNames(request.middleNames());
        student.setGender(request.gender());
        student.setDateOfBirth(request.dateOfBirth());
        student.setResidentialAddress(request.residentialAddress());
        student.setPostalAddress(request.postalAddress());
        student.setHometown(request.hometown());
        student.setNationality(request.nationality());
        student.setReligion(request.religion());
        student.setLanguagesSpoken(request.languagesSpoken());
        student.setImmunized(request.immunized());
        student.setHealthDocumentsSubmitted(request.healthDocumentsSubmitted());
        student.setLivesWith(request.livesWith());
        student.setBloodGroup(request.bloodGroup());
        student.setTotalSiblings(request.totalSiblings());
        student.setOlderSiblings(request.olderSiblings());
        student.setYoungerSiblings(request.youngerSiblings());
        student.setOtherChildrenInHouse(request.otherChildrenInHouse());
        student.setPrimaryTeacherId(request.primaryTeacherId());

        student.setAdditionalContact(mapAdditionalContact(request.additionalContact()));
        student.setGuardians(mapGuardians(request.guardians(), student));
        student.setAuthorizedPickups(mapAuthorizedPickups(request.authorizedPickups(), student));
        return student;
    }

    private AdditionalContact mapAdditionalContact(AdditionalContactRequest request) {
        if (request == null) {
            return null;
        }
        AdditionalContact additionalContact = new AdditionalContact();
        additionalContact.setName(request.name());
        additionalContact.setAddress(request.address());
        additionalContact.setContactNumber(request.contactNumber());
        additionalContact.setRelationship(request.relationship());
        return additionalContact;
    }

    private Set<StudentGuardian> mapGuardians(List<GuardianRequest> guardiansRequest, Student student) {
        Set<StudentGuardian> guardians = new HashSet<>();
        if (guardiansRequest != null) {
            for (GuardianRequest request : guardiansRequest) {
                StudentGuardian guardian = new StudentGuardian();
                guardian.setStudent(student);
                guardian.setRole(request.role() != null ? request.role() : GuardianRole.GUARDIAN);
                guardian.setSurname(request.surname());
                guardian.setFirstName(request.firstName());
                guardian.setMiddleNames(request.middleNames());
                guardian.setResidentialAddress(request.residentialAddress());
                guardian.setReligion(request.religion());
                guardian.setMobileNumber(request.mobileNumber());
                guardian.setOtherContact(request.otherContact());
                guardian.setOccupation(request.occupation());
                guardian.setCompanyName(request.companyName());
                guardian.setBusinessAddress(request.businessAddress());
                guardian.setEmailAddress(request.emailAddress());
                guardian.setRelationshipToPupil(request.relationshipToPupil());
                guardians.add(guardian);
            }
        }
        return guardians;
    }

    private Set<StudentAuthorizedPickup> mapAuthorizedPickups(List<AuthorizedPickupRequest> pickupsRequest, Student student) {
        Set<StudentAuthorizedPickup> pickups = new HashSet<>();
        if (pickupsRequest != null) {
            for (AuthorizedPickupRequest request : pickupsRequest) {
                StudentAuthorizedPickup pickup = new StudentAuthorizedPickup();
                pickup.setStudent(student);
                pickup.setName(request.name());
                pickup.setContactNumber(request.contactNumber());
                pickup.setAddress(request.address());
                pickup.setRelationship(request.relationship());
                pickups.add(pickup);
            }
        }
        return pickups;
    }

    private StudentResponse mapToResponse(Student student) {
        return new StudentResponse(
                student.getId(),
                student.getAdmissionNumber(),
                student.getClassAppliedFor(),
                student.getClassAdmittedTo(),
                student.getPreviousSchool(),
                student.getPreviousClass(),
                student.getSurname(),
                student.getFirstName(),
                student.getMiddleNames(),
                student.getGender(),
                student.getDateOfBirth(),
                student.getResidentialAddress(),
                student.getPostalAddress(),
                student.getHometown(),
                student.getNationality(),
                student.getReligion(),
                student.getLanguagesSpoken(),
                student.isImmunized(),
                student.isHealthDocumentsSubmitted(),
                student.getLivesWith(),
                student.getBloodGroup(),
                student.getTotalSiblings(),
                student.getOlderSiblings(),
                student.getYoungerSiblings(),
                student.getOtherChildrenInHouse(),
                student.getPrimaryTeacherId(),
                mapAdditionalContactResponse(student.getAdditionalContact()),
                mapGuardianResponses(student.getGuardians()),
                mapAuthorizedPickupResponses(student.getAuthorizedPickups()),
                student.getClassEnrollments().stream()
                        .map(StudentClassEnrollment::getClassId)
                        .toList(),
                student.getCreatedAt(),
                student.getUpdatedAt()
        );
    }

    private AdditionalContactResponse mapAdditionalContactResponse(AdditionalContact additionalContact) {
        if (additionalContact == null) {
            return null;
        }
        return new AdditionalContactResponse(
                additionalContact.getName(),
                additionalContact.getContactNumber(),
                additionalContact.getAddress(),
                additionalContact.getRelationship()
        );
    }

    private List<GuardianResponse> mapGuardianResponses(Set<StudentGuardian> guardians) {
        if (guardians == null || guardians.isEmpty()) {
            return List.of();
        }
        List<GuardianResponse> responses = new ArrayList<>();
        for (StudentGuardian guardian : guardians) {
            responses.add(new GuardianResponse(
                    guardian.getRole(),
                    guardian.getSurname(),
                    guardian.getFirstName(),
                    guardian.getMiddleNames(),
                    guardian.getResidentialAddress(),
                    guardian.getReligion(),
                    guardian.getMobileNumber(),
                    guardian.getOtherContact(),
                    guardian.getOccupation(),
                    guardian.getCompanyName(),
                    guardian.getBusinessAddress(),
                    guardian.getEmailAddress(),
                    guardian.getRelationshipToPupil()
            ));
        }
        return responses;
    }

    private List<AuthorizedPickupResponse> mapAuthorizedPickupResponses(Set<StudentAuthorizedPickup> pickups) {
        if (pickups == null || pickups.isEmpty()) {
            return List.of();
        }
        List<AuthorizedPickupResponse> responses = new ArrayList<>();
        for (StudentAuthorizedPickup pickup : pickups) {
            responses.add(new AuthorizedPickupResponse(
                    pickup.getName(),
                    pickup.getContactNumber(),
                    pickup.getAddress(),
                    pickup.getRelationship()
            ));
        }
        return responses;
    }
}
