package com.altera.student.dto;

import com.altera.student.model.Student;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class StudentRequest {
    @NotBlank(message = "First name is required")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String address;
    private String gradeLevel;
    private String parentName;
    private String parentEmail;
    private String parentPhone;
    
    public Student toEntity() {
        Student student = new Student();
        student.setFirstName(this.firstName);
        student.setLastName(this.lastName);
        student.setEmail(this.email);
        student.setPhoneNumber(this.phoneNumber);
        student.setDateOfBirth(this.dateOfBirth);
        student.setAddress(this.address);
        student.setGradeLevel(this.gradeLevel);
        student.setParentName(this.parentName);
        student.setParentEmail(this.parentEmail);
        student.setParentPhone(this.parentPhone);
        return student;
    }
}
