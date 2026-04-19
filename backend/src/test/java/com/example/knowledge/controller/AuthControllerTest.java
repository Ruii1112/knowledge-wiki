package com.example.knowledge.controller;

import static org.junit.jupiter.api.Assertions.*;

import com.example.knowledge.dto.SignupRequest;
import com.example.knowledge.dto.UserResponse;
import com.example.knowledge.usecase.AuthSignupUsecase;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private AuthController authController;

    @Test
    void shouldReturnCreatedStatusOnSuccess() {
        SignupRequest request = new SignupRequest("testuser", "testuser@example.com", "TestPass123");

        ResponseEntity<UserResponse> response = authController.signup(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("testuser", response.getBody().username());
    }

    @Test
    void shouldReturnBadRequestWhenUsernameExists() {
        SignupRequest request1 = new SignupRequest("duplicateuser", "user1@example.com", "Pass123");
        authController.signup(request1);

        SignupRequest request2 = new SignupRequest("duplicateuser", "user2@example.com", "Pass123");

        ResponseEntity<UserResponse> response = authController.signup(request2);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}
