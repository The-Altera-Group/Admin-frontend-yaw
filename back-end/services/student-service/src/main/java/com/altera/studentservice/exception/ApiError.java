package com.altera.studentservice.exception;

import java.time.LocalDateTime;
import java.util.Map;

public record ApiError(
        int status,
        String message,
        String path,
        LocalDateTime timestamp,
        Map<String, String> errors
) {
}
