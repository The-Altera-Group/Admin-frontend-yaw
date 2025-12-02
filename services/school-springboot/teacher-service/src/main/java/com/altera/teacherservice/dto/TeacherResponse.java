package com.altera.teacherservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TeacherResponse {
    
    private UUID id;
    private String employeeId;
    private String title;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String address;
    private String city;
    private String state;
    private String country;
    private String postalCode;
    private boolean isActive;
    private Set<String> roles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Computed property for full name
    public String getFullName() {
        if (title != null && !title.isEmpty()) {
            return String.format("%s %s %s", title, firstName, lastName).trim();
        }
        return String.format("%s %s", firstName, lastName).trim();
    }
}
