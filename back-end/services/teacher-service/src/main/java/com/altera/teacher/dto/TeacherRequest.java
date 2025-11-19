package com.altera.teacher.dto;

import com.altera.teacher.model.Teacher;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

@Data
public class TeacherRequest {
    @NotBlank(message = "First name is required")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private LocalDate hireDate;
    private String address;
    private String qualification;
    private String specialization;
    private String department;
    private Set<String> subjects;
    
    public Teacher toEntity() {
        Teacher teacher = new Teacher();
        teacher.setFirstName(this.firstName);
        teacher.setLastName(this.lastName);
        teacher.setEmail(this.email);
        teacher.setPhoneNumber(this.phoneNumber);
        teacher.setDateOfBirth(this.dateOfBirth);
        teacher.setHireDate(this.hireDate);
        teacher.setAddress(this.address);
        teacher.setQualification(this.qualification);
        teacher.setSpecialization(this.specialization);
        teacher.setDepartment(this.department);
        teacher.setSubjects(this.subjects);
        return teacher;
    }
}
