import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test/utils';
import { ArticleForm } from './ArticleForm';

describe('ArticleForm', () => {
  it('空送信でバリデーション', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<ArticleForm submitLabel="作成" onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: '作成' }));
    expect(await screen.findByText('タイトルは必須です')).toBeInTheDocument();
    expect(screen.getByText('本文は必須です')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('プレビュー切り替えで Markdown 表示 (lazy chunk 経由)', async () => {
    const { user } = renderWithProviders(
      <ArticleForm
        submitLabel="作成"
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        initialValues={{ title: 'T', content: '# 見出し', tags: [] }}
      />,
    );
    await user.click(screen.getByRole('tab', { name: 'プレビュー' }));
    // MarkdownViewer は lazy import なので findBy で chunk 解決を待つ
    expect(await screen.findByRole('heading', { level: 1, name: '見出し' })).toBeInTheDocument();
  });

  it('正常入力で onSubmit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { user } = renderWithProviders(<ArticleForm submitLabel="作成" onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText('タイトル'), 'My Article');
    await user.type(screen.getByLabelText('本文 (Markdown)'), 'body');
    await user.click(screen.getByRole('button', { name: '作成' }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'My Article', content: 'body', tags: [] }),
      expect.anything(),
    );
  });

  it('whitespace-only タイトル/本文を弾く', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<ArticleForm submitLabel="作成" onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText('タイトル'), '   ');
    await user.type(screen.getByLabelText('本文 (Markdown)'), '   \n  ');
    await user.click(screen.getByRole('button', { name: '作成' }));
    expect(await screen.findByText('タイトルは必須です')).toBeInTheDocument();
    expect(screen.getByText('本文は必須です')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('initialValues 反映', () => {
    renderWithProviders(
      <ArticleForm
        submitLabel="更新"
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        initialValues={{
          title: '既存タイトル',
          content: '既存本文',
          tags: ['spring'],
        }}
      />,
    );
    expect(screen.getByLabelText('タイトル')).toHaveValue('既存タイトル');
    expect(screen.getByLabelText('本文 (Markdown)')).toHaveValue('既存本文');
    expect(screen.getByText('#spring')).toBeInTheDocument();
  });
});
