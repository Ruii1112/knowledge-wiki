import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('クリックで onClick が発火', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>送信</Button>);
    await userEvent.click(screen.getByRole('button', { name: '送信' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('isLoading で aria-busy + disabled になる', () => {
    render(<Button isLoading>送信</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('disabled でクリック発火しない', async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        送信
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
