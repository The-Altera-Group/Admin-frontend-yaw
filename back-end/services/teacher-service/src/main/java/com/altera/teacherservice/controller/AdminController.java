package com.altera.teacherservice.controller;

import com.altera.teacherservice.dto.ApiResponse;
import com.altera.teacherservice.dto.RegisterTeacherRequest;
import com.altera.teacherservice.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for admin operations.
 */
@RestController
@RequestMapping("/api/v1/teachers")
@RequiredArgsConstructor
@Tag(name = "Teacher Registration", description = "Teacher registration APIs")
public class AdminController {

    private final AdminService adminService;

    /**
     * Registers a new teacher.
     *
     * @param request The teacher registration request
     * @return Response with success message
     */
    @PostMapping("/register")
    @Operation(summary = "Register a new teacher (public)")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<ApiResponse<Void>> registerTeacher(
            @Valid @RequestBody RegisterTeacherRequest request) {
        adminService.registerTeacher(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<Void>builder()
                        .success(true)
                        .message("Teacher registered successfully. Credentials have been sent to their email.")
                        .build());
    }
}
