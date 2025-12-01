package com.altera.studentservice.controller;

import com.altera.studentservice.dto.StudentRegistrationRequest;
import com.altera.studentservice.dto.StudentResponse;
import com.altera.studentservice.dto.StudentUpdateRequest;
import com.altera.studentservice.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping
    public ResponseEntity<StudentResponse> createStudent(@Valid @RequestBody StudentRegistrationRequest request) {
        StudentResponse response = studentService.createStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> getStudent(@PathVariable UUID id) {
        StudentResponse response = studentService.getStudent(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentResponse> updateStudent(
            @PathVariable UUID id,
            @Valid @RequestBody StudentRegistrationRequest request
    ) {
        StudentResponse response = studentService.updateStudent(id, request);
        return ResponseEntity.ok(response);
    }
    
    @PatchMapping("/{id}")
    @Operation(
        summary = "Partially update a student",
        description = "Update specific fields of a student. Only include the fields you want to update."
    )
    public ResponseEntity<StudentResponse> patchStudent(
            @Parameter(description = "ID of the student to update") @PathVariable UUID id,
            @Valid @RequestBody StudentUpdateRequest request
    ) {
        StudentResponse response = studentService.patchStudent(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable UUID id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<StudentResponse>> listStudents(
            @RequestParam(required = false) String surname,
            @RequestParam(required = false, name = "class") String className
    ) {
        List<StudentResponse> students = studentService.listStudents(surname, className);
        return ResponseEntity.ok(students);
    }

    @PostMapping("/{id}/enroll")
    public ResponseEntity<List<UUID>> enrollStudent(
            @PathVariable UUID id,
            @RequestBody List<UUID> classIds
    ) {
        List<UUID> enrolled = studentService.enrollStudentInClasses(id, classIds);
        return ResponseEntity.ok(enrolled);
    }

    @GetMapping("/{id}/classes")
    public ResponseEntity<List<UUID>> getStudentClasses(@PathVariable UUID id) {
        List<UUID> classIds = studentService.getStudentClasses(id);
        return ResponseEntity.ok(classIds);
    }

    @GetMapping("/{id}/teacher")
    public ResponseEntity<UUID> getStudentTeacher(@PathVariable UUID id) {
        UUID teacherId = studentService.getStudentPrimaryTeacher(id);
        return ResponseEntity.ok(teacherId);
    }
}
