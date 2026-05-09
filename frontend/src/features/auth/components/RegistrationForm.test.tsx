import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test/utils';
import { RegistrationForm } from './RegistrationForm';

describe('RegistrationForm', () => {
  it('whitespace-only ユーザー名を弾く', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<RegistrationForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText('ユーザー名'), '     ');
    await user.type(screen.getByLabelText('メールアドレス'), 'a@b.co');
    await user.type(screen.getByLabelText('パスワード', { selector: 'input' }), 'Password1');
    await user.type(screen.getByLabelText('パスワード（確認）'), 'Password1');
    await user.click(screen.getByRole('button', { name: 'アカウント作成' }));
    expect(
      await screen.findByText('ユーザー名は3文字以上である必要があります'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('パスワード不一致を検出', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<RegistrationForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText('ユーザー名'), 'newuser');
    await user.type(screen.getByLabelText('メールアドレス'), 'new@example.com');
    await user.type(screen.getByLabelText('パスワード', { selector: 'input' }), 'Password1');
    await user.type(screen.getByLabelText('パスワード（確認）'), 'Other1234');
    await user.click(screen.getByRole('button', { name: 'アカウント作成' }));
    expect(await screen.findByText('パスワードが一致しません')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('正常入力で onSubmit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { user } = renderWithProviders(<RegistrationForm onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText('ユーザー名'), 'newuser');
    await user.type(screen.getByLabelText('メールアドレス'), 'new@example.com');
    await user.type(screen.getByLabelText('パスワード', { selector: 'input' }), 'Password1');
    await user.type(screen.getByLabelText('パスワード（確認）'), 'Password1');
    await user.click(screen.getByRole('button', { name: 'アカウント作成' }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'newuser',
        email: 'new@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
      }),
      expect.anything(),
    );
  });
});
