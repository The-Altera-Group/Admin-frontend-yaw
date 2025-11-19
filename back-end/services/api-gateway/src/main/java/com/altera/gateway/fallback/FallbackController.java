package com.altera.gateway.fallback;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@RestController
public class FallbackController {

    @GetMapping("/fallback/teacher-service")
    public Mono<ResponseEntity<Map<String, Object>>> teacherServiceFallback() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "error");
        response.put("message", "Teacher service is currently unavailable. Please try again later.");
        response.put("code", HttpStatus.SERVICE_UNAVAILABLE.value());
        
        return Mono.just(ResponseEntity
            .status(HttpStatus.SERVICE_UNAVAILABLE)
            .body(response));
    }
    
    @GetMapping("/fallback/student-service")
    public Mono<ResponseEntity<Map<String, Object>>> studentServiceFallback() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "error");
        response.put("message", "Student service is currently unavailable. Please try again later.");
        response.put("code", HttpStatus.SERVICE_UNAVAILABLE.value());
        
        return Mono.just(ResponseEntity
            .status(HttpStatus.SERVICE_UNAVAILABLE)
            .body(response));
    }
}
