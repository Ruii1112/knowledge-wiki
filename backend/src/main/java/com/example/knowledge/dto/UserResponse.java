package com.example.knowledge.dto;

import java.time.LocalDateTime;

public record UserResponse(
    Long id,
    String username,
    String email,
    String role,
    Boolean enabled,
    LocalDateTime createdAt
) {}
