package com.example.knowledge.api.dto;

public record SignupRequest(
    String username,
    String email,
    String password
) {}
