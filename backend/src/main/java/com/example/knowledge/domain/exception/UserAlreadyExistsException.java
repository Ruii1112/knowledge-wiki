package com.example.knowledge.domain.exception;

public class UserAlreadyExistsException extends RuntimeException {

    public UserAlreadyExistsException(String field) {
        super(field + " already exists");
    }
}