package com.altera.teacherservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.Set;

@Data
public class TeacherRequest {
    
    @NotBlank(message = "Employee ID is required")
    private String employeeId;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "First name is required")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[+]*[(]?[0-9]{1,4}[)]?[-\s./0-9]*$", 
             message = "Invalid phone number format. Valid formats: +1234567890, (123) 456-7890, 123-456-7890, etc.")
    private String phoneNumber;
    
    @NotBlank(message = "Address is required")
    private String address;
    
    private String city;
    private String state;
    private String country;
    private String postalCode;
    
    private boolean isActive = true;
    
    private Set<String> roles;
}
