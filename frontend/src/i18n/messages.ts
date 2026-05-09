/**
 * UI で表示する固定文言を集約。将来的に i18n (react-intl など) に
 * 切り替える際の基点となる。
 *
 * 使い方: `import { messages } from '@/i18n/messages'` のように import し、
 * UI 側では `messages.auth.invalidCredentials` のように参照する。
 */

export const messages = {
  common: {
    loading: '読み込み中...',
    notFound: '対象が見つかりません',
    unexpectedError: '予期せぬエラーが発生しました',
    retry: '再試行',
  },
  auth: {
    invalidCredentials: 'ユーザー名またはパスワードが違います',
    accountDisabled: 'アカウントが無効化されています',
    loginFailed: 'ログインに失敗しました',
    signupFailed: 'ユーザー登録に失敗しました',
  },
  apiError: {
    needAuth: '認証が必要です',
    forbidden: '権限がありません',
    notFound: '対象が見つかりません',
    requestFailed: 'リクエストに失敗しました',
    responseInvalid: 'API レスポンスの形式が想定と異なります',
  },
  articles: {
    listFailed: '記事一覧の取得に失敗しました',
    fetchFailed: '記事の取得に失敗しました',
    notFound: '記事が見つかりません',
    invalidId: '無効な記事IDです',
    createFailed: '記事の作成に失敗しました',
    updateFailed: '記事の更新に失敗しました',
    deleteFailed: '削除に失敗しました',
    deleteConfirm: 'この記事を削除しますか？',
    noEditPermission: 'この記事を編集する権限がありません',
    staleState: '記事の状態が更新されました。再読み込みしてください',
    emptyResult: '該当する記事がありません',
    backToList: '記事一覧へ',
    backToDetail: '記事へ戻る',
  },
  comments: {
    fetchFailed: 'コメントの取得に失敗しました',
    postFailed: 'コメント投稿に失敗しました',
    empty: 'まだコメントはありません',
  },
  histories: {
    invalidId: '無効なIDです',
    fetchFailed: '履歴の取得に失敗しました',
    detailNotFound: '履歴が見つかりません',
    empty: '編集履歴はまだありません',
    backToList: '履歴一覧へ',
  },
  admin: {
    listFailed: 'ユーザー一覧の取得に失敗しました',
    updateFailed: 'ユーザー更新に失敗しました',
    selfNote: '※ 自分自身のロール / 有効状態は変更できません。',
  },
} as const;
