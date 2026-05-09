# Knowledge App

チーム内の技術知識や調査結果を記事として蓄積・検索できるナレッジ共有Webアプリケーション。

## 技術スタック

| レイヤー | 技術 |
|---|---|
| Frontend | React 19 / TypeScript 5.9 / Vite 8 |
| Backend | Java 25 / Spring Boot 4.0.3 / JOOQ 3.19 |
| Auth | Spring Security 7 + JWT (HS256) |
| DB | MySQL 9.6 |
| Migration | Flyway 12.1 |
| Build | Gradle 9.4.0 / Node.js 22 / npm 10 |

## プロジェクト構成

```
knowledge-app/
├── frontend/       # React SPA (Vite)
├── backend/        # Spring Boot REST API
├── migration/      # Flyway SQLマイグレーション
├── docs/           # 設計ドキュメント (ADR, 要求定義, 要件定義, 基本設計)
├── docker-compose.yml
└── Makefile
```

## 前提条件

- Docker / Docker Compose

ローカル開発で個別に起動する場合は以下も必要:

- Java 25
- Node.js 22 / npm 10

## クイックスタート (Docker)

```bash
# 全サービスを起動 (DB → マイグレーション → Backend → Frontend)
make up

# バックグラウンドで起動する場合
docker compose up -d

# 停止
make down
```

起動後のアクセス先:

| サービス | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080/api/articles |
| MySQL | localhost:3306 (user: `app` / password: `secret`) |

## Makefileコマンド

| コマンド | 説明 |
|---|---|
| `make build` | Dockerイメージのビルド |
| `make up` | 全サービス起動 (マイグレーション自動実行) |
| `make down` | 全サービス停止 |
| `make logs` | 全サービスのログをフォロー |
| `make migrate` | マイグレーションのみ実行 |

## ローカル開発 (Docker不使用)

### Backend

```bash
cd backend
./gradlew bootRun       # http://localhost:8080 で起動
./gradlew test          # テスト実行
./gradlew clean build   # ビルド
```

### Frontend

```bash
cd frontend
npm install
npm run dev             # http://localhost:5173 で起動 (HMR)
npm run build           # プロダクションビルド
```

## ドキュメント

| ドキュメント | パス |
|---|---|
| 要求定義書 | `docs/requirements-definition/` |
| 要件定義書 | `docs/specifications/` |
| 基本設計書 | `docs/basic-design/` |
| ADR (技術判断記録) | `docs/adrs/` |
