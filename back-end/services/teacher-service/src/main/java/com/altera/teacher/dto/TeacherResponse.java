package com.altera.teacher.dto;

import com.altera.teacher.model.Teacher;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private LocalDate hireDate;
    private String address;
    private String qualification;
    private String specialization;
    private String department;
    private Set<String> subjects;
    private String status;
    
    public static TeacherResponse fromEntity(Teacher teacher) {
        return TeacherResponse.builder()
                .id(teacher.getId())
                .firstName(teacher.getFirstName())
                .lastName(teacher.getLastName())
                .email(teacher.getEmail())
                .phoneNumber(teacher.getPhoneNumber())
                .dateOfBirth(teacher.getDateOfBirth())
                .hireDate(teacher.getHireDate())
                .address(teacher.getAddress())
                .qualification(teacher.getQualification())
                .specialization(teacher.getSpecialization())
                .department(teacher.getDepartment())
                .subjects(teacher.getSubjects())
                .status(teacher.getStatus().name())
                .build();
    }
}
