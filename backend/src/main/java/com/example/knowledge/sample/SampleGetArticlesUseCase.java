package com.example.knowledge.sample;

import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class SampleGetArticlesUseCase {

    private final SampleArticleRepository articleRepository;

    public SampleGetArticlesUseCase(SampleArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    public List<SampleArticle> execute() {
        return articleRepository.findAll();
    }
}
