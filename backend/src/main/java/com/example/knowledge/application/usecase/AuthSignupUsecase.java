package com.example.knowledge.application.usecase;

import com.example.knowledge.api.dto.SignupRequest;
import com.example.knowledge.api.dto.UserResponse;
import com.example.knowledge.domain.exception.UserAlreadyExistsException;
import com.example.knowledge.domain.model.User;
import com.example.knowledge.infrastructure.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthSignupUsecase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthSignupUsecase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse execute(SignupRequest request) {

        String email = request.email().toLowerCase().trim();

        String hashedPassword = passwordEncoder.encode(request.password());

        User user = new User(
                null,
                request.username(),
                email,
                hashedPassword,
                "USER",
                true,
                null
        );

        try {
            User savedUser = userRepository.save(user);

            return new UserResponse(
                    savedUser.id(),
                    savedUser.username(),
                    savedUser.email(),
                    savedUser.role(),
                    savedUser.enabled(),
                    savedUser.createdAt()
            );

        } catch (DataIntegrityViolationException e) {
            // TODO: 本当はconstraint名で分岐
            throw new UserAlreadyExistsException("email");
        }
    }
}
