package com.altera.studentservice.repository;

import com.altera.studentservice.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID> {
    Optional<Student> findByAdmissionNumber(String admissionNumber);
}
