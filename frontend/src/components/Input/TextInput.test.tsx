import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TextInput } from './TextInput';

describe('TextInput', () => {
  it('renders with label', () => {
    render(<TextInput id="test" label="Test Label" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(
      <TextInput
        id="test"
        label="Test"
        placeholder="Enter text"
      />
    );
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(
      <TextInput
        id="test"
        label="Test"
        error="This field is required"
      />
    );
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('displays helper text', () => {
    render(
      <TextInput
        id="test"
        label="Test"
        helperText="Helper text"
      />
    );
    expect(screen.getByText('Helper text')).toBeInTheDocument();
  });

  it('applies error styling when error is present', () => {
    const { container } = render(
      <TextInput
        id="test"
        label="Test"
        error="Error message"
      />
    );
    const input = container.querySelector('input');
    expect(input).toHaveClass('inputError');
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <TextInput
        id="test"
        label="Test"
        disabled
      />
    );
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
