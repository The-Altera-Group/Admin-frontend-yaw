package com.altera.teacherservice.service.impl;

import com.altera.teacherservice.dto.RegisterTeacherRequest;
import com.altera.teacherservice.entity.Teacher;
import com.altera.teacherservice.exception.ResourceAlreadyExistsException;
import com.altera.teacherservice.repository.TeacherRepository;
import com.altera.teacherservice.service.AdminService;
import com.altera.teacherservice.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Implementation of the AdminService interface for admin-related operations.
 */
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private static final String DEFAULT_TITLE = "Teacher";
    private static final String DEFAULT_ADDRESS = "Not specified";
    private static final String DEFAULT_EMPLOYEE_ID_PREFIX = "TCH-";

    private final TeacherRepository teacherRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public void registerTeacher(RegisterTeacherRequest request) {
        // Check if email already exists
        if (teacherRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Teacher", "email", request.getEmail());
        }

        // Generate a random password
        String password = generateRandomPassword();

        // Create and save teacher
        Teacher teacher = Teacher.builder()
                .employeeId(generateEmployeeId())
                .title(DEFAULT_TITLE)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(password)
                .phoneNumber(request.getPhoneNumber())
                .address(DEFAULT_ADDRESS)
                .isActive(true)
                .build();

        // Add default teacher role
        teacher.addRole("ROLE_TEACHER");

        teacherRepository.save(teacher);

        // Send email with credentials
        sendTeacherCredentials(teacher, password);
    }

    private String generateEmployeeId() {
        return DEFAULT_EMPLOYEE_ID_PREFIX + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String generateRandomPassword() {
        // Generate a random UUID and take first 8 characters
        return UUID.randomUUID().toString().substring(0, 8);
    }

    private void sendTeacherCredentials(Teacher teacher, String password) {
        String teacherName = String.format("%s %s", teacher.getFirstName(), teacher.getLastName()).trim();
        emailService.sendCredentialsEmail(
            teacher.getEmail(),
            teacherName,
            teacher.getEmail(),
            password
        );
    }
}
