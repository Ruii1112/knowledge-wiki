package com.example.knowledge.infrastructure.persistence;

import com.example.knowledge.jooq.tables.Users;
import com.example.knowledge.domain.model.User;
import com.example.knowledge.infrastructure.repository.UserRepository;
import java.util.Optional;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepositoryJooq implements UserRepository {

    private final DSLContext dsl;
    private static final Users USERS = Users.USERS;

    public UserRepositoryJooq(DSLContext dsl) {
        this.dsl = dsl;
    }

    @Override
    public User save(User user) {
        var record = dsl.insertInto(USERS)
                .columns(USERS.USERNAME, USERS.EMAIL, USERS.PASSWORD_HASH, USERS.ROLE, USERS.ENABLED)
                .values(user.username(), user.email(), user.passwordHash(), user.role(), user.enabled())
                .returningResult(USERS.ID, USERS.CREATED_AT)
                .fetchOne();

        if (record == null) {
            throw new RuntimeException("Failed to save user");
        }

        return new User(
                record.get(USERS.ID),
                user.username(),
                user.email(),
                user.passwordHash(),
                user.role(),
                user.enabled(),
                record.get(USERS.CREATED_AT)
        );
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return dsl.selectFrom(USERS)
                .where(USERS.USERNAME.eq(username))
                .fetchOptional()
                .map(this::mapToUser);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return dsl.selectFrom(USERS)
                .where(USERS.EMAIL.eq(email))
                .fetchOptional()
                .map(this::mapToUser);
    }

    @Override
    public Optional<User> findById(Long id) {
        return dsl.selectFrom(USERS)
                .where(USERS.ID.eq(id))
                .fetchOptional()
                .map(this::mapToUser);
    }

    private User mapToUser(com.example.knowledge.jooq.tables.records.UsersRecord record) {
        return new User(
                record.getId(),
                record.getUsername(),
                record.getEmail(),
                record.getPasswordHash(),
                record.getRole(),
                record.getEnabled(),
                record.getCreatedAt()
        );
    }
}
