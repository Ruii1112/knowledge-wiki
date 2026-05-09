import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Alert } from './Alert';

describe('Alert', () => {
  it('error variant は role=alert', () => {
    render(<Alert variant="error">エラー発生</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('エラー発生');
  });
  it('info variant は role=status', () => {
    render(<Alert variant="info">お知らせ</Alert>);
    expect(screen.getByRole('status')).toHaveTextContent('お知らせ');
  });
  it('success variant は role=status', () => {
    render(<Alert variant="success">完了</Alert>);
    expect(screen.getByRole('status')).toHaveTextContent('完了');
  });
});
