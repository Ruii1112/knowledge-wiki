import { describe, it, expect } from 'vitest';
import { render, screen, userEvent } from '@testing-library/react';
import { PasswordInput } from './PasswordInput';

describe('PasswordInput', () => {
  it('renders with label', () => {
    render(
      <PasswordInput
        id="password"
        label="Password"
      />
    );
    expect(screen.getByText('Password')).toBeInTheDocument();
  });

  it('renders password input as type=password by default', () => {
    render(
      <PasswordInput
        id="password"
        label="Password"
      />
    );
    const input = screen.getByLabelText('Password') as HTMLInputElement;
    expect(input.type).toBe('password');
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(
      <PasswordInput
        id="password"
        label="Password"
      />
    );
    
    const input = screen.getByLabelText('Password') as HTMLInputElement;
    const toggleButton = screen.getByRole('button');

    expect(input.type).toBe('password');
    
    await user.click(toggleButton);
    expect(input.type).toBe('text');
    
    await user.click(toggleButton);
    expect(input.type).toBe('password');
  });

  it('displays error message', () => {
    render(
      <PasswordInput
        id="password"
        label="Password"
        error="Password is required"
      />
    );
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('displays helper text', () => {
    render(
      <PasswordInput
        id="password"
        label="Password"
        helperText="Min 8 characters"
      />
    );
    expect(screen.getByText('Min 8 characters')).toBeInTheDocument();
  });
});
