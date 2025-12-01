package com.altera.studentservice.repository;

import com.altera.studentservice.entity.StudentGuardian;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StudentGuardianRepository extends JpaRepository<StudentGuardian, UUID> {
}
