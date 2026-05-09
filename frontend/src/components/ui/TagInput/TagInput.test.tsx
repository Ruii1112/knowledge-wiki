import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TagInput } from './TagInput';

function setup(initial: string[] = []) {
  const onChange = vi.fn();
  function Wrapper() {
    return <TagInput value={initial} onChange={onChange} />;
  }
  const utils = render(<Wrapper />);
  return { onChange, ...utils };
}

describe('TagInput', () => {
  it('Enter でタグ確定', async () => {
    const { onChange } = setup();
    const input = screen.getByPlaceholderText(/タグを入力/);
    await userEvent.type(input, 'spring{Enter}');
    expect(onChange).toHaveBeenCalledWith(['spring']);
  });

  it('カンマ paste で複数タグ分割', async () => {
    const { onChange } = setup();
    const input = screen.getByPlaceholderText(/タグを入力/);
    await userEvent.click(input);
    await userEvent.paste('spring,react,,vue');
    // paste のあと commit するために blur or Enter
    await userEvent.tab();
    expect(onChange).toHaveBeenCalledWith(['spring', 'react', 'vue']);
  });

  it('大文字混在の重複は normalize 比較で弾く', async () => {
    const { onChange } = setup(['spring']);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'SPRING{Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('Backspace で末尾タグ削除', async () => {
    const { onChange } = setup(['spring', 'react']);
    const input = screen.getByRole('textbox');
    await userEvent.click(input);
    await userEvent.keyboard('{Backspace}');
    expect(onChange).toHaveBeenCalledWith(['spring']);
  });

  it('×ボタンで個別削除', async () => {
    const { onChange } = setup(['spring', 'react']);
    await userEvent.click(screen.getByRole('button', { name: 'springを削除' }));
    expect(onChange).toHaveBeenCalledWith(['react']);
  });

  it('100文字超のタグはエラー表示', async () => {
    const { onChange } = setup();
    const input = screen.getByPlaceholderText(/タグを入力/);
    await userEvent.type(input, `${'a'.repeat(101)}{Enter}`);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText(/100 文字以内/)).toBeInTheDocument();
  });
});
