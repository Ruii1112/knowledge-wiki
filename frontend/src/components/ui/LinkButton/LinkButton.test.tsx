import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LinkButton } from './LinkButton';

describe('LinkButton', () => {
  it('Link として href を持つ', () => {
    render(
      <MemoryRouter>
        <LinkButton to="/articles">記事一覧</LinkButton>
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: '記事一覧' });
    expect(link).toHaveAttribute('href', '/articles');
  });
  it('variant=primary でクラス追加', () => {
    render(
      <MemoryRouter>
        <LinkButton to="/x" variant="primary">
          作成
        </LinkButton>
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: '作成' }).className).toMatch(/primary/);
  });
});
