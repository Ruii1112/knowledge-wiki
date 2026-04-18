import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '@testing-library/react';
import { RegistrationForm } from './RegistrationForm';

describe('RegistrationForm', () => {
  const mockOnSubmit = vi.fn();

  it('renders all form fields', () => {
    render(<RegistrationForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText('ユーザー名')).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText(/^パスワード$/)).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード（確認）')).toBeInTheDocument();
  });

  it('validates username', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByText('アカウント作成');
    await user.click(submitButton);

    expect(screen.getByText('ユーザー名は必須です')).toBeInTheDocument();
  });

  it('validates email', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockOnSubmit} />);
    
    const emailInput = screen.getByLabelText('メールアドレス');
    await user.type(emailInput, 'invalid-email');
    await user.click(screen.getByText('アカウント作成'));

    expect(
      screen.getByText('有効なメールアドレスを入力してください')
    ).toBeInTheDocument();
  });

  it('validates password strength', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockOnSubmit} />);
    
    const passwordInput = screen.getByLabelText(/^パスワード$/);
    await user.type(passwordInput, 'weak');
    await user.click(screen.getByText('アカウント作成'));

    expect(
      screen.getByText('パスワードは8文字以上である必要があります')
    ).toBeInTheDocument();
  });

  it('validates password confirmation', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockOnSubmit} />);
    
    const passwordInput = screen.getByLabelText(/^パスワード$/);
    const confirmInput = screen.getByLabelText('パスワード（確認）');
    
    await user.type(passwordInput, 'StrongPass123');
    await user.type(confirmInput, 'DifferentPass456');
    await user.click(screen.getByText('アカウント作成'));

    expect(screen.getByText('パスワードが一致しません')).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockOnSubmit} />);
    
    await user.type(screen.getByLabelText('ユーザー名'), 'johndoe');
    await user.type(screen.getByLabelText('メールアドレス'), 'john@example.com');
    await user.type(screen.getByLabelText(/^パスワード$/), 'StrongPass123');
    await user.type(screen.getByLabelText('パスワード（確認）'), 'StrongPass123');
    
    await user.click(screen.getByText('アカウント作成'));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      username: 'johndoe',
      email: 'john@example.com',
      password: 'StrongPass123',
      confirmPassword: 'StrongPass123',
    });
  });

  it('displays global error message', () => {
    render(
      <RegistrationForm
        onSubmit={mockOnSubmit}
        error="Registration failed"
      />
    );
    
    expect(screen.getByText('Registration failed')).toBeInTheDocument();
  });

  it('disables form when loading', () => {
    render(
      <RegistrationForm
        onSubmit={mockOnSubmit}
        isLoading={true}
      />
    );
    
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByLabelText('ユーザー名')).toBeDisabled();
  });
});
