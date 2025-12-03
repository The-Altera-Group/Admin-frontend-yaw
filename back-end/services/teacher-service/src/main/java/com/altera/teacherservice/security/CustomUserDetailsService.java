package com.altera.teacherservice.security;

import com.altera.teacherservice.entity.Teacher;
import com.altera.teacherservice.exception.ResourceNotFoundException;
import com.altera.teacherservice.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final TeacherRepository teacherRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> 
                    new UsernameNotFoundException("Teacher not found with email: " + email)
                );

        if (!teacher.isActive()) {
            throw new UsernameNotFoundException("Teacher account is disabled");
        }

        return new User(
                teacher.getEmail(),
                teacher.getPassword(),
                teacher.getRoles().stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                        .collect(Collectors.toList())
        );
    }

    public UserDetails loadUserById(UUID id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> 
                    new ResourceNotFoundException("Teacher", "id", id.toString())
                );

        return new User(
                teacher.getEmail(),
                teacher.getPassword(),
                teacher.getRoles().stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                        .collect(Collectors.toList())
        );
    }
}
