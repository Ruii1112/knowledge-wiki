# ADR-001 技術スタック選定

## Status
Accepted

## Context

本プロジェクトではチーム内で利用するナレッジ共有Webアプリケーションを開発する。

以下の要件を満たす必要がある。

- Webブラウザから利用できる
- REST APIベースの構成
- 初学者が学習しやすい技術
- 実務に近い構成
- 将来的な拡張が可能

## Decision

以下のスタックとバージョンを初期値として固定する。

|レイヤー|技術|
|---|---|
|Frontend|React 19.2 / TypeScript 5.9 / Vite 8|
|Backend|Java 25 LTS / Spring Boot 4.0.3 / Spring Data JPA 4.0.4|
|Authentication|Spring Security 7 + JWT (HS256)|
|Database|MySQL Community 9.6|
|Migration|Flyway 12.1|
|Tooling|Node.js 22 / npm 10 / Gradle Wrapper|

## Consequences

### 利点

- React + TypeScriptでSPAを高速に構築でき、ViteのHMRでDXも高い。
- 最新LTSのJava 25とSpring Boot 4系の組み合わせで長期的なサポートを得られる。
- Spring Security 7とJWTでREST APIをステートレスに保護できる。
- MySQL 9.6はチーム実績があり、FlywayでDDLをバージョン管理できる。

### 欠点

- Java + Springのセットアップがやや重く、CIでのビルド時間が長くなる。
- 最新LTSの採用により、開発者がJava 25とNode.js 22をローカルに用意する必要がある。
