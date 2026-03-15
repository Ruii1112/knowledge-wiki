package com.example.knowledge.sample;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sample/articles")
public class SampleArticleController {

    private final SampleGetArticlesUseCase getArticlesUseCase;

    public SampleArticleController(SampleGetArticlesUseCase getArticlesUseCase) {
        this.getArticlesUseCase = getArticlesUseCase;
    }

    @GetMapping
    public List<SampleArticleResponse> listArticles() {
        return getArticlesUseCase.execute().stream()
                .map(this::toResponse)
                .toList();
    }

    private SampleArticleResponse toResponse(SampleArticle article) {
        return new SampleArticleResponse(article.id(), article.title(), article.author(), article.createdAt());
    }
}
