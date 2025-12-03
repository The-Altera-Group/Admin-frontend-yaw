package com.altera.studentservice.service;

import com.altera.studentservice.dto.AuthorizedPickupResponse;
import com.altera.studentservice.dto.StudentRegistrationRequest;
import com.altera.studentservice.dto.StudentResponse;
import com.altera.studentservice.dto.StudentUpdateRequest;

import java.util.List;
import java.util.UUID;

public interface StudentService {

    StudentResponse createStudent(StudentRegistrationRequest request);

    StudentResponse getStudent(UUID studentId);

    StudentResponse updateStudent(UUID studentId, StudentRegistrationRequest request);
    
    StudentResponse patchStudent(UUID studentId, StudentUpdateRequest request);

    void deleteStudent(UUID studentId);

    List<StudentResponse> listStudents(String surname, String className);

    List<UUID> enrollStudentInClasses(UUID studentId, List<UUID> classIds);

    List<UUID> getStudentClasses(UUID studentId);

    UUID getStudentPrimaryTeacher(UUID studentId);
}
