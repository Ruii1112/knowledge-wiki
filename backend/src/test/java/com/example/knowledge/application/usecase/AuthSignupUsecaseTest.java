package com.example.knowledge.application.usecase;

import static org.junit.jupiter.api.Assertions.*;

import com.example.knowledge.api.dto.SignupRequest;
import com.example.knowledge.api.dto.UserResponse;
import com.example.knowledge.domain.model.User;
import com.example.knowledge.infrastructure.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
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
    @DisplayName("should create user successfully with valid input")
    void shouldCreateUserSuccessfully() {
        SignupRequest request = new SignupRequest("newuser", "newuser@example.com", "SecurePass123");

        UserResponse response = authSignupUsecase.execute(request);

        assertNotNull(response.id());
        assertEquals("newuser", response.username());
        assertEquals("newuser@example.com", response.email());
        assertEquals("USER", response.role());
        assertTrue(response.enabled());
        assertNotNull(response.createdAt());
    }

    @Test
    @DisplayName("should throw exception when username already exists")
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

        assertThrows(IllegalArgumentException.class, () -> authSignupUsecase.execute(request),
                "Should throw IllegalArgumentException when username exists");
    }

    @Test
    @DisplayName("should throw exception when email already exists")
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

        assertThrows(IllegalArgumentException.class, () -> authSignupUsecase.execute(request),
                "Should throw IllegalArgumentException when email exists");
    }

    @Test
    @DisplayName("should hash password correctly")
    void shouldHashPasswordCorrectly() {
        String rawPassword = "SecurePass123";
        SignupRequest request = new SignupRequest("newuser", "newuser@example.com", rawPassword);

        authSignupUsecase.execute(request);

        User savedUser = userRepository.findByUsername("newuser").get();
        assertTrue(passwordEncoder.matches(rawPassword, savedUser.passwordHash()),
                "Password should be hashed using BCrypt");
        assertNotEquals(rawPassword, savedUser.passwordHash(),
                "Raw password should not match hashed password");
    }

    @Test
    @DisplayName("should set role to USER by default")
    void shouldSetRoleToUserByDefault() {
        SignupRequest request = new SignupRequest("newuser", "newuser@example.com", "SecurePass123");

        UserResponse response = authSignupUsecase.execute(request);

        assertEquals("USER", response.role());
    }

    @Test
    @DisplayName("should set enabled to true by default")
    void shouldSetEnabledToTrueByDefault() {
        SignupRequest request = new SignupRequest("newuser", "newuser@example.com", "SecurePass123");

        UserResponse response = authSignupUsecase.execute(request);

        assertTrue(response.enabled());
    }

    // Mock implementation for testing
    static class MockUserRepository implements UserRepository {
        private final Map<String, User> users = new HashMap<>();
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
