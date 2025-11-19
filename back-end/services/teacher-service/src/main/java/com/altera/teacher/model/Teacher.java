package com.altera.teacher.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "teachers")
public class Teacher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private LocalDate hireDate;
    private String address;
    private String qualification;
    private String specialization;
    private String department;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "teacher_subjects", joinColumns = @JoinColumn(name = "teacher_id"))
    @Column(name = "subject")
    private Set<String> subjects = new HashSet<>();
    
    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;
    
    public enum Status {
        ACTIVE, ON_LEAVE, INACTIVE, RETIRED
    }
}
