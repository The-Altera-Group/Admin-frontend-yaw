package com.altera.teacher.service;

import com.altera.teacher.dto.TeacherRequest;
import com.altera.teacher.dto.TeacherResponse;
import com.altera.teacher.exception.ResourceNotFoundException;
import com.altera.teacher.model.Teacher;
import com.altera.teacher.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final TeacherRepository teacherRepository;

    @Transactional
    public TeacherResponse createTeacher(TeacherRequest request) {
        if (teacherRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        
        Teacher teacher = request.toEntity();
        teacher = teacherRepository.save(teacher);
        return TeacherResponse.fromEntity(teacher);
    }

    public TeacherResponse getTeacherById(Long id) {
        Teacher teacher = teacherRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + id));
        return TeacherResponse.fromEntity(teacher);
    }

    public List<TeacherResponse> getAllTeachers() {
        return teacherRepository.findAll().stream()
            .map(TeacherResponse::fromEntity)
            .collect(Collectors.toList());
    }

    @Transactional
    public TeacherResponse updateTeacher(Long id, TeacherRequest request) {
        Teacher teacher = teacherRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + id));
        
        if (!teacher.getEmail().equals(request.getEmail()) && 
            teacherRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        
        teacher.setFirstName(request.getFirstName());
        teacher.setLastName(request.getLastName());
        teacher.setEmail(request.getEmail());
        teacher.setPhoneNumber(request.getPhoneNumber());
        teacher.setDateOfBirth(request.getDateOfBirth());
        teacher.setHireDate(request.getHireDate());
        teacher.setAddress(request.getAddress());
        teacher.setQualification(request.getQualification());
        teacher.setSpecialization(request.getSpecialization());
        teacher.setDepartment(request.getDepartment());
        teacher.setSubjects(request.getSubjects());
        
        teacher = teacherRepository.save(teacher);
        return TeacherResponse.fromEntity(teacher);
    }

    @Transactional
    public void deleteTeacher(Long id) {
        if (!teacherRepository.existsById(id)) {
            throw new ResourceNotFoundException("Teacher not found with id: " + id);
        }
        teacherRepository.deleteById(id);
    }

    public long getActiveTeachersCount() {
        return teacherRepository.countByStatus(Teacher.Status.ACTIVE);
    }
}
