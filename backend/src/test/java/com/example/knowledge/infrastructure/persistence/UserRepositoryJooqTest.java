package com.example.knowledge.infrastructure.persistence;

import static org.junit.jupiter.api.Assertions.*;

import com.example.knowledge.domain.model.User;
import com.example.knowledge.infrastructure.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
@DisplayName("UserRepositoryJooq Integration Tests")
class UserRepositoryJooqTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldSaveAndFindUser() {
        User user = new User(
                null,
                "user",
                "test@example.com",
                "hash",
                "USER",
                true,
                null
        );

        User saved = userRepository.save(user);

        assertNotNull(saved.id());

        Optional<User> found = userRepository.findByEmail("test@example.com");

        assertTrue(found.isPresent());
    }

    @Test
    void shouldEnforceUniqueEmail() {
        User user1 = new User(null, "user1", "dup@example.com", "h", "USER", true, null);
        User user2 = new User(null, "user2", "dup@example.com", "h", "USER", true, null);

        userRepository.save(user1);

        assertThrows(DataIntegrityViolationException.class, () -> {
            userRepository.save(user2);
        });
    }
}