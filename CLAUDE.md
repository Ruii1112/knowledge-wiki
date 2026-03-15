# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Team knowledge-sharing web application: React SPA + Spring Boot REST API + MySQL, with Flyway for schema migration. Documentation is in Japanese (docs/).

## Architecture

Three-layer SPA architecture: `frontend/` → REST/JSON → `backend/` → `MySQL 9.6`

Backend package structure (`com.example.knowledge`):
- `controller` — HTTP layer (thin, delegates to usecase)
- `usecase` — application/business logic
- `repository` / `infrastructure` — data access (jOOQ)
- `model` / `dto` — domain objects and API transfer objects
- `config` / `security` — cross-cutting concerns (Spring Security 7 + JWT HS256)
- `sample` — Docker動作確認用サンプルコード（本実装時に削除予定）

Migration scripts live in `migration/sql/` using Flyway naming: `V{n}__{description}.sql`

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 / TypeScript 5.9 / Vite 8 |
| Backend | Java 25 / Spring Boot 4.0.3 / jOOQ 3.19 / Gradle 9.4.0 |
| API Docs | SpringDoc OpenAPI + Swagger UI (Actuator endpoint) |
| Auth | Spring Security 7 + JWT (HS256) |
| DB | MySQL 9.6 (InnoDB) |
| Migration | Flyway 12.1 |
| Runtime | Node.js 22 / npm 10 |

## Development Commands

### Docker (full stack)
```bash
make up          # start all services (db → migration complete → backend → frontend)
make down        # stop all services
make migrate     # run Flyway migrations only
make build       # build Docker images
```

### Frontend (`cd frontend`)
```bash
npm install      # install dependencies
npm run dev      # dev server on localhost:5173 (HMR)
npm run build    # production build
```

### Backend (`cd backend`)
```bash
./gradlew clean build   # build (includes jOOQ codegen from migration SQL)
./gradlew jooqCodegen   # jOOQ code generation only
./gradlew bootRun       # run without DB (sample API only, DataSource disabled)
./gradlew test           # run JUnit 5 tests
```

Profiles:
- **default** — DataSource/jOOQ自動構成を除外。MySQL不要でサンプルAPI起動可
- **docker** — `make up` 経由で有効化。DataSource接続あり

## Code Style

- **Frontend**: 2-space indent, functional components, PascalCase component files, camelCase hooks/utils, kebab-case assets. Colocate styles with components.
- **Backend**: 4-space indent, Java 25, lowercase packages, PascalCase classes. Descriptive test method names (e.g. `shouldReturnArticlesWhenTagMatches`).
- Lint/format before committing: `npm run lint` (frontend), `./gradlew checkstyleMain spotlessApply` (backend).

## Commit Convention

Conventional Commits: `feat:`, `fix(scope):`, `docs:`, `refactor:`, etc.

## API Specification

- API定義: `docs/api/openapi.yaml` (信頼できるソース、API Firstで運用)
- Swagger UI: `http://localhost:8080/actuator/swagger-ui` (バックエンド起動時)
- ビルド時に `docs/api/openapi.yaml` → バックエンドの静的リソースへ自動コピー

## Key Design Documents

- `docs/api/` — OpenAPI specification
- `docs/adrs/` — Architecture Decision Records (tech stack, architecture, auth, DB design, article history)
- `docs/requirements-definition/` — requirements
- `docs/specifications/` — specifications
- `docs/basic-design/` — basic design
