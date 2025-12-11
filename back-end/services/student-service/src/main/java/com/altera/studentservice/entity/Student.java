package com.altera.studentservice.entity;

import com.altera.studentservice.model.Gender;
import com.altera.studentservice.model.LivesWith;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "admission_number", unique = true)
    private String admissionNumber;

    @Column(name = "class_applied_for")
    private String classAppliedFor;

    @Column(name = "class_admitted_to")
    private String classAdmittedTo;

    @Column(name = "previous_school")
    private String previousSchool;

    @Column(name = "previous_class")
    private String previousClass;

    @Column(nullable = false)
    private String surname;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "middle_names")
    private String middleNames;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "residential_address")
    private String residentialAddress;

    @Column(name = "postal_address")
    private String postalAddress;

    private String hometown;

    private String nationality;

    private String religion;

    @ElementCollection
    @Column(name = "language_spoken")
    private List<String> languagesSpoken;

    @Column(name = "immunized")
    private boolean immunized;

    @Column(name = "health_docs_submitted")
    private boolean healthDocumentsSubmitted;

    @Enumerated(EnumType.STRING)
    @Column(name = "lives_with")
    private LivesWith livesWith;

    @Column(name = "blood_group")
    private String bloodGroup;

    @Column(name = "total_siblings")
    private Integer totalSiblings;

    @Column(name = "older_siblings")
    private Integer olderSiblings;

    @Column(name = "younger_siblings")
    private Integer youngerSiblings;

    @Column(name = "other_children_in_house")
    private Integer otherChildrenInHouse;

    @Column(name = "primary_teacher_id")
    private UUID primaryTeacherId;

    @Embedded
    private AdditionalContact additionalContact;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<StudentGuardian> guardians = new HashSet<>();

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<StudentAuthorizedPickup> authorizedPickups = new HashSet<>();

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<StudentClassEnrollment> classEnrollments = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Student() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getAdmissionNumber() {
        return admissionNumber;
    }

    public void setAdmissionNumber(String admissionNumber) {
        this.admissionNumber = admissionNumber;
    }

    public String getClassAppliedFor() {
        return classAppliedFor;
    }

    public void setClassAppliedFor(String classAppliedFor) {
        this.classAppliedFor = classAppliedFor;
    }

    public String getClassAdmittedTo() {
        return classAdmittedTo;
    }

    public void setClassAdmittedTo(String classAdmittedTo) {
        this.classAdmittedTo = classAdmittedTo;
    }

    public String getPreviousSchool() {
        return previousSchool;
    }

    public void setPreviousSchool(String previousSchool) {
        this.previousSchool = previousSchool;
    }

    public String getPreviousClass() {
        return previousClass;
    }

    public void setPreviousClass(String previousClass) {
        this.previousClass = previousClass;
    }

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getMiddleNames() {
        return middleNames;
    }

    public void setMiddleNames(String middleNames) {
        this.middleNames = middleNames;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getResidentialAddress() {
        return residentialAddress;
    }

    public void setResidentialAddress(String residentialAddress) {
        this.residentialAddress = residentialAddress;
    }

    public String getPostalAddress() {
        return postalAddress;
    }

    public void setPostalAddress(String postalAddress) {
        this.postalAddress = postalAddress;
    }

    public String getHometown() {
        return hometown;
    }

    public void setHometown(String hometown) {
        this.hometown = hometown;
    }

    public String getNationality() {
        return nationality;
    }

    public void setNationality(String nationality) {
        this.nationality = nationality;
    }

    public String getReligion() {
        return religion;
    }

    public void setReligion(String religion) {
        this.religion = religion;
    }

    public List<String> getLanguagesSpoken() {
        return languagesSpoken;
    }

    public void setLanguagesSpoken(List<String> languagesSpoken) {
        this.languagesSpoken = languagesSpoken;
    }

    public boolean isImmunized() {
        return immunized;
    }

    public void setImmunized(boolean immunized) {
        this.immunized = immunized;
    }

    public boolean isHealthDocumentsSubmitted() {
        return healthDocumentsSubmitted;
    }

    public void setHealthDocumentsSubmitted(boolean healthDocumentsSubmitted) {
        this.healthDocumentsSubmitted = healthDocumentsSubmitted;
    }

    public LivesWith getLivesWith() {
        return livesWith;
    }

    public void setLivesWith(LivesWith livesWith) {
        this.livesWith = livesWith;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public Integer getTotalSiblings() {
        return totalSiblings;
    }

    public void setTotalSiblings(Integer totalSiblings) {
        this.totalSiblings = totalSiblings;
    }

    public Integer getOlderSiblings() {
        return olderSiblings;
    }

    public void setOlderSiblings(Integer olderSiblings) {
        this.olderSiblings = olderSiblings;
    }

    public Integer getYoungerSiblings() {
        return youngerSiblings;
    }

    public void setYoungerSiblings(Integer youngerSiblings) {
        this.youngerSiblings = youngerSiblings;
    }

    public Integer getOtherChildrenInHouse() {
        return otherChildrenInHouse;
    }

    public void setOtherChildrenInHouse(Integer otherChildrenInHouse) {
        this.otherChildrenInHouse = otherChildrenInHouse;
    }

    public UUID getPrimaryTeacherId() {
        return primaryTeacherId;
    }

    public void setPrimaryTeacherId(UUID primaryTeacherId) {
        this.primaryTeacherId = primaryTeacherId;
    }

    public AdditionalContact getAdditionalContact() {
        return additionalContact;
    }

    public void setAdditionalContact(AdditionalContact additionalContact) {
        this.additionalContact = additionalContact;
    }

    public Set<StudentGuardian> getGuardians() {
        return guardians;
    }

    public void setGuardians(Set<StudentGuardian> guardians) {
        this.guardians = guardians;
    }

    public Set<StudentAuthorizedPickup> getAuthorizedPickups() {
        return authorizedPickups;
    }

    public void setAuthorizedPickups(Set<StudentAuthorizedPickup> authorizedPickups) {
        this.authorizedPickups = authorizedPickups;
    }

    public Set<StudentClassEnrollment> getClassEnrollments() {
        return classEnrollments;
    }

    public void setClassEnrollments(Set<StudentClassEnrollment> classEnrollments) {
        this.classEnrollments = classEnrollments;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
