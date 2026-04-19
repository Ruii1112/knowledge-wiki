package com.example.knowledge.presentation.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.knowledge.api.dto.SignupRequest;
import com.example.knowledge.api.dto.UserResponse;
import com.example.knowledge.application.usecase.AuthSignupUsecase;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@DisplayName("AuthController Unit Tests")
@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthSignupUsecase authSignupUsecase;

    private AuthController authController;

    @BeforeEach
    void setUp() {
        authController = new AuthController(authSignupUsecase);
    }

    @Test
    @DisplayName("should return CREATED status on successful signup")
    void shouldReturnCreatedStatusOnSuccess() {
        SignupRequest request = new SignupRequest("testuser", "test@example.com", "TestPass123");
        UserResponse expectedResponse = new UserResponse(
                1L, "testuser", "test@example.com", "USER", true, LocalDateTime.now()
        );
        when(authSignupUsecase.execute(request)).thenReturn(expectedResponse);

        ResponseEntity<UserResponse> response = authController.signup(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(expectedResponse, response.getBody());
        verify(authSignupUsecase, times(1)).execute(request);
    }

    @Test
    @DisplayName("should return BAD_REQUEST when username already exists")
    void shouldReturnBadRequestWhenUsernameExists() {
        SignupRequest request = new SignupRequest("existinguser", "new@example.com", "Pass123");
        when(authSignupUsecase.execute(request))
                .thenThrow(new IllegalArgumentException("Username already exists"));

        ResponseEntity<UserResponse> response = authController.signup(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNull(response.getBody());
        verify(authSignupUsecase, times(1)).execute(request);
    }

    @Test
    @DisplayName("should return BAD_REQUEST when email already exists")
    void shouldReturnBadRequestWhenEmailExists() {
        SignupRequest request = new SignupRequest("newuser", "existing@example.com", "Pass123");
        when(authSignupUsecase.execute(request))
                .thenThrow(new IllegalArgumentException("Email already exists"));

        ResponseEntity<UserResponse> response = authController.signup(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNull(response.getBody());
    }

    @Test
    @DisplayName("should return INTERNAL_SERVER_ERROR on unexpected exception")
    void shouldReturnInternalServerErrorOnException() {
        SignupRequest request = new SignupRequest("testuser", "test@example.com", "Pass123");
        when(authSignupUsecase.execute(request))
                .thenThrow(new RuntimeException("Database error"));

        ResponseEntity<UserResponse> response = authController.signup(request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNull(response.getBody());
    }

    @Test
    @DisplayName("should call usecase with correct request")
    void shouldCallUsecaseWithCorrectRequest() {
        SignupRequest request = new SignupRequest("testuser", "test@example.com", "TestPass123");
        UserResponse expectedResponse = new UserResponse(
                1L, "testuser", "test@example.com", "USER", true, LocalDateTime.now()
        );
        when(authSignupUsecase.execute(request)).thenReturn(expectedResponse);

        authController.signup(request);

        verify(authSignupUsecase).execute(request);
    }
}
