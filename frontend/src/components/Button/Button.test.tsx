import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text content', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders primary variant by default', () => {
    const { container } = render(<Button>Click</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('primary');
  });

  it('renders different variants', () => {
    const { rerender, container } = render(
      <Button variant="secondary">Click</Button>
    );
    expect(container.querySelector('button')).toHaveClass('secondary');

    rerender(<Button variant="ghost">Click</Button>);
    expect(container.querySelector('button')).toHaveClass('ghost');
  });

  it('renders different sizes', () => {
    const { rerender, container } = render(
      <Button size="sm">Click</Button>
    );
    expect(container.querySelector('button')).toHaveClass('sm');

    rerender(<Button size="md">Click</Button>);
    expect(container.querySelector('button')).toHaveClass('md');

    rerender(<Button size="lg">Click</Button>);
    expect(container.querySelector('button')).toHaveClass('lg');
  });

  it('shows loading state', () => {
    render(<Button isLoading>Click</Button>);
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when loading', () => {
    render(<Button isLoading>Click</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
