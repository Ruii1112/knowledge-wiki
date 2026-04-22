package com.example.knowledge.application.usecase;

import static org.junit.jupiter.api.Assertions.*;

import com.example.knowledge.api.dto.SignupRequest;
import com.example.knowledge.api.dto.UserResponse;
import com.example.knowledge.domain.exception.UserAlreadyExistsException;
import com.example.knowledge.domain.model.User;
import com.example.knowledge.infrastructure.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@DisplayName("AuthSignupUsecase Unit Tests")
class AuthSignupUsecaseTest {

    private AuthSignupUsecase authSignupUsecase;
    private MockUserRepository userRepository;
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository = new MockUserRepository();
        passwordEncoder = new BCryptPasswordEncoder();
        authSignupUsecase = new AuthSignupUsecase(userRepository, passwordEncoder);
    }

    @Test
    void shouldCreateUserSuccessfully() {
        SignupRequest request = new SignupRequest("newuser", "newuser@example.com", "SecurePass123");

        UserResponse response = authSignupUsecase.execute(request);

        assertNotNull(response.id());
        assertEquals("newuser", response.username());
        assertEquals("newuser@example.com", response.email());
    }

    @Test
    void shouldThrowExceptionWhenEmailExists() {
        userRepository.saveUser(new User(
                1L, "user", "test@example.com", "pass", "USER", true, LocalDateTime.now()
        ));

        SignupRequest request = new SignupRequest("newuser", "test@example.com", "SecurePass123");

        assertThrows(UserAlreadyExistsException.class,
                () -> authSignupUsecase.execute(request));
    }

    @Test
    void shouldNormalizeEmail() {
        SignupRequest request = new SignupRequest("newuser", "TEST@EXAMPLE.COM", "SecurePass123");

        UserResponse response = authSignupUsecase.execute(request);

        assertEquals("test@example.com", response.email());
    }

    @Test
    void shouldHashPassword() {
        String raw = "SecurePass123";
        SignupRequest request = new SignupRequest("newuser", "a@a.com", raw);

        authSignupUsecase.execute(request);

        User saved = userRepository.findByUsername("newuser").get();

        assertTrue(passwordEncoder.matches(raw, saved.passwordHash()));
    }

    // Mock Repository（email UNIQUE再現）
    static class MockUserRepository implements UserRepository {

        private final Map<Long, User> users = new HashMap<>();
        private long idCounter = 1L;

        @Override
        public User save(User user) {
            boolean exists = users.values().stream()
                    .anyMatch(u -> u.email().equals(user.email()));

            if (exists) {
                throw new DataIntegrityViolationException("Duplicate email");
            }

            User saved = new User(
                    idCounter++,
                    user.username(),
                    user.email(),
                    user.passwordHash(),
                    user.role(),
                    user.enabled(),
                    LocalDateTime.now()
            );

            users.put(saved.id(), saved);
            return saved;
        }

        @Override
        public Optional<User> findByUsername(String username) {
            return users.values().stream()
                    .filter(u -> u.username().equals(username))
                    .findFirst();
        }

        @Override
        public Optional<User> findByEmail(String email) {
            return users.values().stream()
                    .filter(u -> u.email().equals(email))
                    .findFirst();
        }

        @Override
        public Optional<User> findById(Long id) {
            return Optional.ofNullable(users.get(id));
        }

        void saveUser(User user) {
            users.put(user.id(), user);
        }
    }
}