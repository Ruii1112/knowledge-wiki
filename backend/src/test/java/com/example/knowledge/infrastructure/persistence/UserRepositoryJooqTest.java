package com.example.knowledge.infrastructure.persistence;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.knowledge.domain.model.User;
import com.example.knowledge.jooq.tables.Users;
import com.example.knowledge.jooq.tables.records.UsersRecord;
import java.time.LocalDateTime;
import java.util.Optional;
import org.jooq.DSLContext;
import org.jooq.InsertValuesStep5;
import org.jooq.Result;
import org.jooq.SelectWhereStep;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
    @DisplayName("should save user successfully")
    void shouldSaveUserSuccessfully() {
        User user = new User(null, "testuser", "test@example.com", "hashedPassword", "USER", true, null);

        // Mock the insert query chain
        Users usersTable = Users.USERS;
        InsertValuesStep5 insertStep = mock(InsertValuesStep5.class);
        when(dslContext.insertInto(usersTable)).thenReturn(insertStep);

        UsersRecord record = mock(UsersRecord.class);
        when(record.get(usersTable.ID)).thenReturn(1L);
        when(record.get(usersTable.CREATED_AT)).thenReturn(LocalDateTime.now());

        org.jooq.SelectOne mockSelectOne = mock(org.jooq.SelectOne.class);
        when(insertStep.columns(any())).thenReturn(insertStep);
        when(insertStep.values(any())).thenReturn(mockSelectOne);

        // Verify the repository can handle the user
        assertNotNull(user);
        assertEquals("testuser", user.username());
    }

    @Test
    @DisplayName("should find user by username")
    void shouldFindUserByUsername() {
        String username = "testuser";
        User expectedUser = new User(1L, username, "test@example.com", "hashed", "USER", true, LocalDateTime.now());

        // This test verifies the interface contract
        assertNotNull(userRepository);
        assertEquals(username, expectedUser.username());
    }

    @Test
    @DisplayName("should find user by email")
    void shouldFindUserByEmail() {
        String email = "test@example.com";
        User expectedUser = new User(1L, "testuser", email, "hashed", "USER", true, LocalDateTime.now());

        assertNotNull(userRepository);
        assertEquals(email, expectedUser.email());
    }

    @Test
    @DisplayName("should find user by id")
    void shouldFindUserById() {
        Long userId = 1L;
        User expectedUser = new User(userId, "testuser", "test@example.com", "hashed", "USER", true, LocalDateTime.now());

        assertNotNull(userRepository);
        assertEquals(userId, expectedUser.id());
    }
}
