package com.example.knowledge.presentation.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.knowledge.api.dto.UserResponse;
import com.example.knowledge.application.usecase.AuthSignupUsecase;
import com.example.knowledge.domain.exception.UserAlreadyExistsException;
import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AuthController.class)
@DisplayName("AuthController Tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthSignupUsecase usecase;

    @Test
    void shouldReturn201() throws Exception {

        when(usecase.execute(any()))
                .thenReturn(new UserResponse(
                        1L, "user", "test@example.com", "USER", true, LocalDateTime.now()
                ));

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                    {
                      "username": "user",
                      "email": "test@example.com",
                      "password": "password123"
                    }
                """))
                .andExpect(status().isCreated());
    }

    @Test
    void shouldReturn400OnValidationError() throws Exception {

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                    {
                      "username": "",
                      "email": "invalid",
                      "password": "123"
                    }
                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturn409WhenEmailExists() throws Exception {

        when(usecase.execute(any()))
                .thenThrow(new UserAlreadyExistsException("email"));

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                    {
                      "username": "user",
                      "email": "test@example.com",
                      "password": "password123"
                    }
                """))
                .andExpect(status().isConflict());
    }
}