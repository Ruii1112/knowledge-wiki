import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test/utils';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('空送信でバリデーションエラー、onSubmit は呼ばれない', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<LoginForm onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: 'ログイン' }));
    expect(await screen.findByText('ユーザー名は必須です')).toBeInTheDocument();
    expect(screen.getByText('パスワードは必須です')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('whitespace-only も拒否', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<LoginForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText('ユーザー名'), '   ');
    await user.type(screen.getByLabelText('パスワード'), '   ');
    await user.click(screen.getByRole('button', { name: 'ログイン' }));
    expect(await screen.findByText('ユーザー名は必須です')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('正常入力で onSubmit を呼ぶ', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { user } = renderWithProviders(<LoginForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText('ユーザー名'), 'admin');
    await user.type(screen.getByLabelText('パスワード'), 'password');
    await user.click(screen.getByRole('button', { name: 'ログイン' }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'admin', password: 'password' }),
      expect.anything(),
    );
  });

  it('error prop が表示される', () => {
    renderWithProviders(<LoginForm onSubmit={vi.fn()} error="認証失敗" />);
    expect(screen.getByRole('alert')).toHaveTextContent('認証失敗');
  });
});
