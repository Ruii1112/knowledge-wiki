import { zodResolver } from '@hookform/resolvers/zod';
import { lazy, Suspense, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Button, StatusMessage, TagInput, TextInput } from '../../../components/ui';
import { ArticleFormSchema, type ArticleFormValues } from '../schemas';
import styles from './ArticleForm.module.css';

export type { ArticleFormValues };

// MarkdownViewer (react-markdown 含む 47KB gzip) は preview mode の時だけ読む
const MarkdownViewer = lazy(() =>
  import('../../../components/ui/Markdown/MarkdownViewer').then((m) => ({
    default: m.MarkdownViewer,
  })),
);

interface ArticleFormProps {
  initialValues?: Partial<ArticleFormValues>;
  submitLabel: string;
  onSubmit: (values: ArticleFormValues) => Promise<void>;
  onCancel?: () => void;
  error?: string;
}

type Mode = 'edit' | 'preview';

export function ArticleForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
  error,
}: ArticleFormProps) {
  const [mode, setMode] = useState<Mode>('edit');

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(ArticleFormSchema),
    defaultValues: {
      title: initialValues?.title ?? '',
      content: initialValues?.content ?? '',
      tags: initialValues?.tags ?? [],
    },
  });

  const content = watch('content');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      {error && <Alert>{error}</Alert>}

      <TextInput
        id="title"
        label="タイトル"
        placeholder="記事タイトル"
        disabled={isSubmitting}
        error={errors.title?.message}
        {...register('title')}
      />

      <div className={styles.field}>
        <label htmlFor="tags" className={styles.label}>
          タグ
        </label>
        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <TagInput
              id="tags"
              value={field.value ?? []}
              onChange={field.onChange}
              disabled={isSubmitting}
            />
          )}
        />
      </div>

      <div className={styles.field}>
        <div className={styles.bodyHeader}>
          <label htmlFor="content" className={styles.label}>
            本文 (Markdown)
          </label>
          <div className={styles.tabs} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'edit'}
              className={`${styles.tab} ${mode === 'edit' ? styles.tabActive : ''}`}
              onClick={() => setMode('edit')}
            >
              編集
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'preview'}
              className={`${styles.tab} ${mode === 'preview' ? styles.tabActive : ''}`}
              onClick={() => setMode('preview')}
            >
              プレビュー
            </button>
          </div>
        </div>
        {mode === 'edit' ? (
          <textarea
            id="content"
            className={styles.textarea}
            placeholder="# 見出し&#10;&#10;本文を Markdown で記述..."
            rows={16}
            disabled={isSubmitting}
            {...register('content')}
          />
        ) : (
          <div className={styles.preview}>
            {content?.trim() ? (
              <Suspense fallback={<StatusMessage busy>読み込み中...</StatusMessage>}>
                <MarkdownViewer source={content} />
              </Suspense>
            ) : (
              <p className={styles.previewEmpty}>本文がまだありません</p>
            )}
          </div>
        )}
        {errors.content && <p className={styles.fieldError}>{errors.content.message}</p>}
      </div>

      <div className={styles.actions}>
        {onCancel && (
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            キャンセル
          </button>
        )}
        <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
          {isSubmitting ? '保存中...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
