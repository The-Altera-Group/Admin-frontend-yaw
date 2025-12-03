package com.altera.teacherservice.repository;

import com.altera.teacherservice.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, UUID> {
    
    Optional<Teacher> findByEmployeeId(String employeeId);
    
    boolean existsByEmployeeId(String employeeId);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT t FROM Teacher t WHERE " +
           "LOWER(t.firstName) LIKE LOWER(concat('%', :query, '%')) OR " +
           "LOWER(t.lastName) LIKE LOWER(concat('%', :query, '%'))")
    List<Teacher> searchByName(@Param("query") String query);
    
    @Query("SELECT t FROM Teacher t WHERE t.email = :email")
    Optional<Teacher> findByEmail(@Param("email") String email);
    
    @Query("SELECT t FROM Teacher t WHERE t.phoneNumber = :phoneNumber")
    Optional<Teacher> findByPhoneNumber(@Param("phoneNumber") String phoneNumber);
    
    @Query("SELECT t FROM Teacher t WHERE t.isActive = :isActive")
    List<Teacher> findByActiveStatus(@Param("isActive") boolean isActive);
    
    @Query("SELECT t FROM Teacher t WHERE t.employeeId = :employeeId AND t.id != :id")
    Optional<Teacher> findByEmployeeIdAndNotId(@Param("employeeId") String employeeId, @Param("id") UUID id);
    
    @Query("SELECT t FROM Teacher t WHERE t.email = :email AND t.id != :id")
    Optional<Teacher> findByEmailAndNotId(@Param("email") String email, @Param("id") UUID id);
}
