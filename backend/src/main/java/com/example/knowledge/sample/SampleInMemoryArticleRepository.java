package com.example.knowledge.sample;

import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public class SampleInMemoryArticleRepository implements SampleArticleRepository {

    private final List<SampleArticle> seedArticles = List.of(
            new SampleArticle(1L, "はじめてのSpring Boot", "alice", OffsetDateTime.now().minusDays(2)),
            new SampleArticle(2L, "React + Vite超入門", "bob", OffsetDateTime.now().minusDays(1))
    );

    @Override
    public List<SampleArticle> findAll() {
        return seedArticles;
    }
}
