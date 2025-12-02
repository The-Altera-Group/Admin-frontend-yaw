package com.altera.teacherservice.service;

import com.altera.teacherservice.dto.RegisterTeacherRequest;

public interface AdminService {
    void registerTeacher(RegisterTeacherRequest request);
}
