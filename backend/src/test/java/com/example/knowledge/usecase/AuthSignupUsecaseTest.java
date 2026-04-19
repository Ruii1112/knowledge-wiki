package com.example.knowledge.usecase;

import static org.junit.jupiter.api.Assertions.*;

import com.example.knowledge.dto.SignupRequest;
import com.example.knowledge.dto.UserResponse;
import com.example.knowledge.model.User;
import com.example.knowledge.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

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
        assertEquals("USER", response.role());
        assertTrue(response.enabled());
    }

    @Test
    void shouldThrowExceptionWhenUsernameExists() {
        userRepository.saveUser(new User(
                1L,
                "existinguser",
                "existing@example.com",
                "hashedpassword",
                "USER",
                true,
                LocalDateTime.now()
        ));

        SignupRequest request = new SignupRequest("existinguser", "newuser@example.com", "SecurePass123");

        assertThrows(IllegalArgumentException.class, () -> authSignupUsecase.execute(request));
    }

    @Test
    void shouldThrowExceptionWhenEmailExists() {
        userRepository.saveUser(new User(
                1L,
                "existinguser",
                "existing@example.com",
                "hashedpassword",
                "USER",
                true,
                LocalDateTime.now()
        ));

        SignupRequest request = new SignupRequest("newuser", "existing@example.com", "SecurePass123");

        assertThrows(IllegalArgumentException.class, () -> authSignupUsecase.execute(request));
    }

    @Test
    void shouldHashPasswordCorrectly() {
        SignupRequest request = new SignupRequest("newuser", "newuser@example.com", "SecurePass123");

        authSignupUsecase.execute(request);

        User savedUser = userRepository.findByUsername("newuser").get();
        assertTrue(passwordEncoder.matches("SecurePass123", savedUser.passwordHash()));
    }

    // Mock implementation for testing
    static class MockUserRepository implements UserRepository {
        private java.util.Map<String, User> users = new java.util.HashMap<>();
        private long idCounter = 1L;

        @Override
        public User save(User user) {
            User savedUser = new User(
                    idCounter++,
                    user.username(),
                    user.email(),
                    user.passwordHash(),
                    user.role(),
                    user.enabled(),
                    LocalDateTime.now()
            );
            users.put(user.username(), savedUser);
            return savedUser;
        }

        @Override
        public Optional<User> findByUsername(String username) {
            return Optional.ofNullable(users.get(username));
        }

        @Override
        public Optional<User> findByEmail(String email) {
            return users.values().stream()
                    .filter(u -> u.email().equals(email))
                    .findFirst();
        }

        @Override
        public Optional<User> findById(Long id) {
            return users.values().stream()
                    .filter(u -> u.id().equals(id))
                    .findFirst();
        }

        void saveUser(User user) {
            users.put(user.username(), user);
        }
    }
}
