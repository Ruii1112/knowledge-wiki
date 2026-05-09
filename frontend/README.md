# Knowledge Wiki — Frontend

React + TypeScript + Vite で構築された SPA。バックエンドは MSW でモック可能なため、単独で起動・開発できる。

## ディレクトリ構成

```
src/
├── api/                # Zod schemas (OpenAPI と同期)
│   └── schemas.ts
├── lib/                # アプリ横断の純粋ユーティリティ
│   ├── apiClient.ts    # fetch ラッパー (JWT付与, 401フック, schema検証)
│   ├── queryClient.ts  # TanStack Query 設定
│   ├── queryKeys.ts    # キー集約
│   ├── format.ts       # 日付フォーマッタ
│   ├── id.ts           # parsePositiveId
│   └── mocks/          # MSW (browser/node)
├── components/         # 横断 UI
│   ├── ui/             # Button, Input群, Markdown, Alert, StatusMessage, LinkButton
│   ├── Layout/         # AppLayout, Header
│   └── ErrorBoundary/
├── features/           # ドメイン別 (Bulletproof React 風)
│   ├── auth/
│   │   ├── api/        # service + TanStack Query hooks
│   │   ├── components/ # LoginForm, RegistrationForm
│   │   ├── context/    # AuthContext (useMeQuery 連動)
│   │   ├── pages/      # LoginPage, RegistrationPage
│   │   ├── routes/     # ProtectedRoute
│   │   └── schemas.ts  # SignupFormSchema (UI 都合)
│   ├── articles/       # 記事 + 履歴
│   ├── comments/       # コメント
│   └── admin/          # ユーザー管理
├── pages/              # 横断ページ (NotFound)
├── i18n/messages.ts    # 固定文言 (将来の i18n 切替基点)
├── styles/             # globals.css + tokens.css (デザイントークン)
├── test/               # vitest setup + integration tests
├── App.tsx             # ルーティング (route 単位 lazy import)
└── main.tsx            # QueryClientProvider + DEV時のみ MSW 起動
```

## 起動

```bash
npm install   # 初回 (prepare で git hook 自動有効化)
npm run dev   # http://localhost:5173
```

`VITE_DISABLE_MSW=true npm run dev` で MSW を切れる (実バックエンド接続)。

## モック用テストアカウント (MSW)

| username | password   | role  | enabled      |
| -------- | ---------- | ----- | ------------ |
| `admin`  | `password` | ADMIN | ✓            |
| `user1`  | `password` | USER  | ✓            |
| `user2`  | `password` | USER  | ✗ (無効化済) |

## スクリプト

| コマンド                | 内容                         |
| ----------------------- | ---------------------------- |
| `npm run dev`           | Vite dev server (5173)       |
| `npm run build`         | 本番ビルド (`dist/`)         |
| `npm run preview`       | ビルド結果のプレビュー       |
| `npm run lint`          | ESLint (warnings も fail)    |
| `npm run lint:fix`      | 自動修正                     |
| `npm run format`        | Prettier 整形                |
| `npm run format:check`  | 整形差分チェック (CI で使用) |
| `npm run test`          | Vitest watch                 |
| `npm run test:ui`       | Vitest UI                    |
| `npm run test:coverage` | カバレッジ計測               |
| `npm run size`          | バンドルサイズ予算チェック   |

## 品質ゲート

| 項目       | 設定                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| TypeScript | strict、`tsc --noEmit`                                                                                 |
| ESLint     | `eslint:recommended` + react / react-hooks / jsx-a11y / import / typescript-eslint、`--max-warnings=0` |
| Prettier   | `printWidth: 100`, `singleQuote`, `trailingComma: 'all'`                                               |
| Husky      | pre-commit で `lint-staged` (frontend or .husky 変更時のみ)                                            |
| Vitest     | jsdom, MSW 流用、85 tests                                                                              |
| size-limit | 初期 JS 120 KB / Markdown 55 KB / CSS 10 KB (gzip)                                                     |
| CI         | typecheck + lint + format:check + test + build + size                                                  |

## 主要技術

- **TanStack Query** — サーバー状態管理。各画面の `useEffect+useState+cancelled` を `useQuery`/`useMutation` に置換。401 グローバル処理、楽観更新+ロールバック、queryKey 管理 (`lib/queryKeys.ts`)
- **React Hook Form + Zod** — フォーム宣言化。RHF 都合の form schema は `features/*/schemas.ts`、API 契約 schema は `api/schemas.ts` に分離
- **MSW** — `lib/mocks/` 配下で全エンドポイントをモック。テストでも本番と同じ handlers を流用 (`src/test/setup.ts`) し dev/test drift を回避
- **デザイントークン** — `styles/tokens.css` で CSS variables を集約、共通 UI から参照

## 設計ドキュメント

- `../docs/api/openapi.yaml` (信頼できるソース)
- `../docs/specifications/` (機能要件・画面要件)
- `../docs/basic-design/` (アーキテクチャ・DB・API・履歴管理)
- `../docs/adrs/` (Architecture Decision Records)
