package com.example.knowledge.domain.model;

import java.time.LocalDateTime;

public record User(
    Long id,
    String username,
    String email,
    String passwordHash,
    String role,
    Boolean enabled,
    LocalDateTime createdAt
) {}
