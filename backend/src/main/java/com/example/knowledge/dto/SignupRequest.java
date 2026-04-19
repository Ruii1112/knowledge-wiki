package com.example.knowledge.dto;

public record SignupRequest(
    String username,
    String email,
    String password
) {}
