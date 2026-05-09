import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusMessage } from './StatusMessage';

describe('StatusMessage', () => {
  it('busy=true で aria-busy=true', () => {
    render(<StatusMessage busy>読み込み中</StatusMessage>);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-busy', 'true');
    expect(el).toHaveTextContent('読み込み中');
  });
  it('busy=false がデフォルト', () => {
    render(<StatusMessage>空状態</StatusMessage>);
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'false');
  });
});
