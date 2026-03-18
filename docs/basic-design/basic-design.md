# ナレッジWikiシステム 基本設計書

## 1. システム構成

### 1.1 アーキテクチャ
```
Browser
  ↓
React SPA (frontend)
  ↓ REST API
Spring Boot (backend)
  ↓
MySQL (database)
```
フロントエンドからはREST API経由でSpring Bootにアクセスし、永続化処理はMySQLが担う。APIへのアクセスはJWTで保護する。

バックエンド内部は以下のレイヤー構成で実装する。

```
controller → usecase → repository / infrastructure
        ↘ model / dto (共有)
config / security（共通設定・認可）
```
controllerは入出力を受け持ち、usecaseでドメインロジックをまとめ、repository/infrastructureでデータアクセスを行う。

### 1.2 技術スタック
|項目|技術|
|---|---|
|フロントエンド|React 19 / TypeScript 5.9 / Vite 8|
|バックエンド|Java 25 (LTS) / Spring Boot 4.0.3 / jOOQ 3.19|
|認証|Spring Security 7 + JWT|
|データベース|MySQL 9.6.|
|マイグレーション|Flyway 12.1.|
|API形式|REST + JSON|
|API仕様管理|OpenAPI 3.1 (API First) + SpringDoc Swagger UI|

## 2. 画面遷移

### 2.1 一般ユーザー動線
```
ユーザー登録 → ログイン
  ↓
記事一覧
  ↓
記事詳細
  ├─ コメント投稿
  └─ 履歴一覧 → 履歴詳細
  ↓
記事編集 (権限保有者のみ) → 保存後に記事詳細へ戻る
```

### 2.2 管理者動線
```
記事一覧
  ↓
ユーザー管理 (ユーザー検索 / 権限変更 / 無効化)
```

## 3. データベース設計

### 3.1 テーブル一覧
|テーブル名|用途|
|---|---|
|users|ユーザーアカウント|
|articles|記事の本体情報|
|article_histories|記事編集の履歴|
|tags|タグマスタ|
|article_tags|記事とタグの紐付け|
|comments|記事に付与されたコメント|

### 3.2 ER概要
```
users (1) ─── (n) articles (1) ─── (n) comments
                 │
                 └─ (n) article_histories

articles (n) ─── (n) tags   ※article_tagsで中間テーブル構成
```

### 3.3 テーブル定義
#### users
|カラム|型|備考|
|---|---|---|
|id|BIGINT PK|採番|
|username|VARCHAR(50)|一意|
|email|VARCHAR(255)|一意|
|password_hash|VARCHAR(255)|BCrypt|
|role|VARCHAR(20)|`USER` / `ADMIN`|
|enabled|BOOLEAN|有効状態（デフォルト`TRUE`）|
|created_at|DATETIME|作成日時|

#### articles
|カラム|型|備考|
|---|---|---|
|id|BIGINT PK|採番|
|title|VARCHAR(200)|検索対象|
|content|LONGTEXT|Markdown想定|
|author_id|BIGINT FK(users.id)|作成者|
|created_at|DATETIME|作成日時|
|updated_at|DATETIME|更新日時|

#### article_histories
|カラム|型|備考|
|---|---|---|
|id|BIGINT PK|採番|
|article_id|BIGINT FK(articles.id)|対象記事|
|title|VARCHAR(200)|履歴時点のタイトル|
|content|LONGTEXT|履歴時点の本文|
|version|INT|1始まりの連番|
|edited_by|BIGINT FK(users.id)|編集者|
|edited_at|DATETIME|編集日時|

#### tags
|カラム|型|備考|
|---|---|---|
|id|BIGINT PK|採番|
|name|VARCHAR(50)|一意|

#### article_tags
|カラム|型|備考|
|---|---|---|
|article_id|BIGINT FK(articles.id)|複合PK|
|tag_id|BIGINT FK(tags.id)|複合PK|

#### comments
|カラム|型|備考|
|---|---|---|
|id|BIGINT PK|採番|
|article_id|BIGINT FK(articles.id)|対象記事|
|user_id|BIGINT FK(users.id)|投稿者|
|content|TEXT|コメント本文|
|created_at|DATETIME|投稿日時|

## 4. API設計

API仕様は`docs/api/openapi.yaml`で管理する（API First）。バックエンド起動時に`http://localhost:8080/actuator/swagger-ui`でSwagger UIから参照可能。

### 4.1 共通仕様
- Base URLは`/api`。全エンドポイントはJSONを入出力とする。
- `Authorization: Bearer <JWT>`ヘッダーで認証する（認証APIのみ除く）。
- タイムスタンプはISO 8601（例：`2026-03-01T10:30:00Z`）で統一。

### 4.2 認証API
|機能|Method|Path|説明|
|---|---|---|---|
|ユーザー登録|POST|`/auth/signup`|新規ユーザーアカウントを作成|
|ログイン|POST|`/auth/login`|ユーザー名とパスワードでJWTを発行|

※ログアウトはクライアント側でJWTを破棄することで実現する（サーバー側エンドポイントなし）。

Request
```json
{
  "username": "user",
  "password": "password"
}
```
Response
```json
{
  "token": "JWT_TOKEN",
  "expiresIn": 3600
}
```

### 4.3 記事API
|機能|Method|Path|説明|
|---|---|---|---|
|記事一覧|GET|`/articles`|ページング＋キーワード・タグ条件検索|
|記事詳細|GET|`/articles/{id}`|単一記事と最新コメント概要|
|記事作成|POST|`/articles`|記事の新規登録（認証必須）|
|記事更新|PUT|`/articles/{id}`|タイトル・本文・タグ編集|
|記事削除|DELETE|`/articles/{id}`|作成者または管理者のみ|

記事一覧 Response 例
```json
[
  {
    "id": 1,
    "title": "Spring Boot入門",
    "author": "user1",
    "tags": ["spring", "backend"],
    "createdAt": "2026-03-01T09:00:00Z",
    "updatedAt": "2026-03-02T12:30:00Z"
  }
]
```

記事作成 Request 例
```json
{
  "title": "Spring Securityガイド",
  "content": "記事内容...",
  "tags": ["spring", "security"]
}
```

### 4.4 履歴API
|機能|Method|Path|説明|
|---|---|---|---|
|履歴一覧|GET|`/articles/{id}/histories`|記事のバージョン一覧|
|履歴詳細|GET|`/articles/{id}/histories/{historyId}`|指定バージョンの内容|

### 4.5 コメントAPI
|機能|Method|Path|説明|
|---|---|---|---|
|コメント一覧|GET|`/articles/{id}/comments`|記事に紐づくコメント（ページング）|
|コメント投稿|POST|`/articles/{id}/comments`|本文を投稿（認証必須）|

コメント投稿 Request 例
```json
{
  "content": "参考になりました"
}
```

### 4.6 ユーザー管理API(管理者のみ)
|機能|Method|Path|説明|
|---|---|---|---|
|ユーザー一覧|GET|`/admin/users`|管理者がユーザー一覧を取得|
|ユーザー情報更新|PATCH|`/admin/users/{userId}`|ロールや有効状態を変更|

## 5. 認証フロー
1. ユーザーが`POST /auth/login`に資格情報を送信。
2. Spring Securityが認証し、署名付きJWTを発行。
3. フロントエンドはローカルストレージ等にトークンを保持。
4. API呼び出し時に`Authorization`ヘッダーへ付与し、バックエンドで検証。

## 6. バージョン履歴管理
1. 記事更新前に直前バージョンを`article_histories`へ保存（タイトル・本文・編集者・編集日時・バージョン番号）。
2. 最新版を`articles`へ上書きし、`updated_at`を更新。
3. 履歴画面では`article_histories`を降順取得し、任意のバージョン詳細を参照できるようにする。
