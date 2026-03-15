package com.example.knowledge.sample;

import java.time.OffsetDateTime;

public record SampleArticle(Long id, String title, String author, OffsetDateTime createdAt) {}
