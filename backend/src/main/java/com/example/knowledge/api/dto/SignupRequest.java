package com.example.knowledge.api.dto;

import jakarta.validation.constraints.*;

public record SignupRequest(
        @NotBlank(message = "username is required")
        @Size(min = 3, max = 50, message = "username must be 3-50 chars")
        String username,

        @NotBlank(message = "email is required")
        @Email(message = "invalid email format")
        String email,

        @NotBlank(message = "password is required")
        @Size(min = 8, message = "password must be at least 8 chars")
        String password
) {}
