# ADR-002 システムアーキテクチャ

## Status
Accepted

## Context

要求仕様では、UIの拡張性とAPIの再利用性を両立させる必要がある。Webブラウザ、ネイティブアプリ、将来的な外部連携から同一APIを利用できる構成が求められた。

## Decision

React SPA + Spring Boot REST API + MySQLの3層アーキテクチャを採用する。

```
Browser
  ↓
React SPA (Vite)
  ↓ REST API / JSON
Spring Boot (controller → usecase → repository / infrastructure)
  ↓
MySQL 9.6 + Flyway
```

- フロントエンドはSPAとして画面遷移をクライアント側で完結。
- APIはSpring Boot 4.0で実装し、`controller`（入出力）→`usecase`（アプリケーションロジック）→`repository/infrastructure`（データアクセス）で責務を分離、`model/dto`は共有コンテキストとして利用、`config/security`で横断的関心事を管理。
- データアクセスはSpring Data JPA、スキーマ管理はFlywayで行う。

## Consequences

### 利点

- フロントとバックを独立デプロイでき、CDN配信も容易。
- controller/usecase/repository分離でテスト境界が明確になり保守性が向上。
- APIがステートレスなため、将来的なスケールアウトが容易。

### 欠点

- SPAとAPIを別デプロイにするためCI/CDパイプラインが2本必要。
- ネットワーク境界が増える分、ローカル開発でのモックやCORS対策が必要。
