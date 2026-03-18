# ADR-004 データベース設計

## Status
Accepted

## Context

記事・コメント・タグ・履歴を横断して検索できるデータモデルが必要であり、参照整合性と監査のために強い一貫性が求められる。

## Decision

- MySQL 9.6 (InnoDB) を採用し、FlywayでDDLをバージョン管理する。
- 正規化されたテーブル群を定義する。

|テーブル|用途|主なインデックス|
|---|---|---|
|users|アカウント|`username` unique, `email` unique|
|articles|記事本体|`author_id`, `created_at`, `title`(FULLTEXT予定)|
|article_histories|記事履歴|`article_id`, `version` unique（複合）|
|comments|コメント|`article_id`, `created_at`|
|tags|タグマスタ|`name` unique|
|article_tags|記事とタグの多対多|`article_id`, `tag_id` (複合PK)|

- すべてのテーブルに`created_at`（必要に応じ`updated_at`）を持たせ、履歴・監査を容易にする。

## Consequences

### 利点

- 外部キー制約とトランザクションで参照整合性を担保でき、履歴やコメントの孤児レコードを防げる。
- Flywayにより、環境ごとのスキーマ差分をなくしCI/CDに組み込みやすい。

### 欠点

- 正規化モデルのため、タグ検索などでJOIN数が増えクエリ最適化が必要。
- スキーマ進化時はDDLレビューとマイグレーション計画が必須で、アジャイル開発では運用コストが上がる。
