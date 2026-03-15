import { useEffect, useState } from "react";

type ArticleResponse = {
  id: number;
  title: string;
  author: string;
  createdAt: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export default function App() {
  const [articles, setArticles] = useState<ArticleResponse[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/sample/articles`)
      .then((res) => res.json())
      .then(setArticles)
      .catch(() => setArticles([]));
  }, []);

  return (
    <main style={{ fontFamily: "system-ui", padding: "2rem" }}>
      <h1>Knowledge App Sample</h1>
      <p>Backendから記事を取得して表示する簡易サンプルです。</p>
      <ul>
        {articles.map((article) => (
          <li key={article.id}>
            <strong>{article.title}</strong> by {article.author} ({new Date(article.createdAt).toLocaleString()})
          </li>
        ))}
      </ul>
      {articles.length === 0 && <p>記事がまだありません。</p>}
    </main>
  );
}
