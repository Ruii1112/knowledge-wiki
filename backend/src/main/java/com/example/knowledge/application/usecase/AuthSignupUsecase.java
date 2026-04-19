package com.example.knowledge.application.usecase;

import com.example.knowledge.api.dto.SignupRequest;
import com.example.knowledge.api.dto.UserResponse;
import com.example.knowledge.domain.model.User;
import com.example.knowledge.infrastructure.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthSignupUsecase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthSignupUsecase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse execute(SignupRequest request) {
        // Check if username already exists
        if (userRepository.findByUsername(request.username()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }

        // Check if email already exists
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Hash password and create user
        String hashedPassword = passwordEncoder.encode(request.password());
        User user = new User(
                null,
                request.username(),
                request.email(),
                hashedPassword,
                "USER",
                true,
                null
        );

        User savedUser = userRepository.save(user);

        return new UserResponse(
                savedUser.id(),
                savedUser.username(),
                savedUser.email(),
                savedUser.role(),
                savedUser.enabled(),
                savedUser.createdAt()
        );
    }
}
