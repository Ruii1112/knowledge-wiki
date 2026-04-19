package com.example.knowledge.controller;

import com.example.knowledge.dto.SignupRequest;
import com.example.knowledge.dto.UserResponse;
import com.example.knowledge.usecase.AuthSignupUsecase;
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
    public ResponseEntity<UserResponse> signup(@RequestBody SignupRequest request) {
        try {
            UserResponse response = authSignupUsecase.execute(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
