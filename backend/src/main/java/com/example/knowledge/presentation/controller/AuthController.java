package com.example.knowledge.presentation.controller;

import com.example.knowledge.api.dto.SignupRequest;
import com.example.knowledge.api.dto.UserResponse;
import com.example.knowledge.application.usecase.AuthSignupUsecase;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthSignupUsecase authSignupUsecase;

    public AuthController(AuthSignupUsecase authSignupUsecase) {
        this.authSignupUsecase = authSignupUsecase;
    }

    @PostMapping("/signup")
    public ResponseEntity<UserResponse> signup(
            @Valid @RequestBody SignupRequest request
    ) {
        UserResponse response = authSignupUsecase.execute(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
