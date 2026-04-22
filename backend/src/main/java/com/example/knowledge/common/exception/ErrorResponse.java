package com.example.knowledge.common.exception;

import java.time.LocalDateTime;

public record ErrorResponse(
        String code,
        String message,
        Object details,
        LocalDateTime timestamp
) {}