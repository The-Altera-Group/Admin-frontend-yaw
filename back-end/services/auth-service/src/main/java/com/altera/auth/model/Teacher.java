package com.altera.auth.model;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.HashSet;
import java.util.Set;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@PrimaryKeyJoinColumn(name = "user_id")
@Table(name = "teachers")
public class Teacher extends User {
    private String firstName;
    private String lastName;
    private String subject;
    private Set<String> qualifications = new HashSet<>();
    private boolean isAdmin = false;
    
    public Teacher() {
        this.setRole(UserRole.TEACHER);
    }
}
