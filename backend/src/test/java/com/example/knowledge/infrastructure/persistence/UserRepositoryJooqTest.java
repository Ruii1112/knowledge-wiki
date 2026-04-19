package com.example.knowledge.infrastructure.persistence;

import static org.junit.jupiter.api.Assertions.*;

import com.example.knowledge.domain.model.User;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.jooq.DSLContext;

@DisplayName("UserRepositoryJooq Unit Tests")
@ExtendWith(MockitoExtension.class)
class UserRepositoryJooqTest {

    @Mock
    private DSLContext dslContext;

    private UserRepositoryJooq userRepository;

    @BeforeEach
    void setUp() {
        userRepository = new UserRepositoryJooq(dslContext);
    }

    @Test
    @DisplayName("should create UserRepositoryJooq with DSLContext")
    void shouldCreateUserRepositoryJooq() {
        assertNotNull(userRepository);
    }

    @Test
    @DisplayName("should have UserRepository interface")
    void shouldImplementUserRepository() {
        assertTrue(userRepository instanceof com.example.knowledge.infrastructure.repository.UserRepository);
    }
}

