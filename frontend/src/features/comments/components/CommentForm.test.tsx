import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test/utils';
import { CommentForm } from './CommentForm';

describe('CommentForm', () => {
  it('whitespace-only を弾く', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<CommentForm onSubmit={onSubmit} />);
    await user.type(screen.getByPlaceholderText('コメントを入力...'), '   ');
    await user.click(screen.getByRole('button', { name: 'コメント投稿' }));
    expect(await screen.findByText('コメント本文を入力してください')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('正常入力で onSubmit を呼び、入力をリセット', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { user } = renderWithProviders(<CommentForm onSubmit={onSubmit} />);
    const ta = screen.getByPlaceholderText('コメントを入力...') as HTMLTextAreaElement;
    await user.type(ta, '良い記事!');
    await user.click(screen.getByRole('button', { name: 'コメント投稿' }));
    expect(onSubmit).toHaveBeenCalledWith('良い記事!');
    expect(ta.value).toBe('');
  });

  it('onSubmit が reject すると alert 表示', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('投稿失敗'));
    const { user } = renderWithProviders(<CommentForm onSubmit={onSubmit} />);
    await user.type(screen.getByPlaceholderText('コメントを入力...'), 'x');
    await user.click(screen.getByRole('button', { name: 'コメント投稿' }));
    expect(await screen.findByText('投稿失敗')).toBeInTheDocument();
  });
});
