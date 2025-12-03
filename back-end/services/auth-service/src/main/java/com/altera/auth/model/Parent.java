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
@Table(name = "parent")
public class Parent extends User {
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Set<Long> childrenIds = new HashSet<>();
    
    public Parent() {
        this.setRole(UserRole.PARENT);
    }
}
