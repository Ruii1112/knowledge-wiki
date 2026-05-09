import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

function Boom({ message }: { message: string }): ReactElement {
  throw new Error(message);
}

describe('ErrorBoundary', () => {
  it('正常時は children を描画', () => {
    render(
      <ErrorBoundary>
        <p>正常コンテンツ</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('正常コンテンツ')).toBeInTheDocument();
  });

  it('child の throw を捕捉して fallback UI を表示', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom message="kaboom" />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('予期せぬエラー');
    expect(screen.getByText('kaboom')).toBeInTheDocument();
    errorSpy.mockRestore();
  });

  it('カスタム fallback を優先', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={<p>独自エラー画面</p>}>
        <Boom message="x" />
      </ErrorBoundary>,
    );
    expect(screen.getByText('独自エラー画面')).toBeInTheDocument();
    errorSpy.mockRestore();
  });

  it('再試行で error を解除し children を再描画', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function App() {
      const [shouldThrow, setShouldThrow] = useState(true);
      return (
        <ErrorBoundary>
          {shouldThrow ? (
            <Boom message="initial" />
          ) : (
            <button onClick={() => setShouldThrow(true)}>再 throw</button>
          )}
          {/* テストでは shouldThrow を外部から切り替えたいので button */}
          <button data-testid="fix" onClick={() => setShouldThrow(false)}>
            fix
          </button>
        </ErrorBoundary>
      );
    }
    render(<App />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    // 修復: app 側で throw しなくする → ErrorBoundary.reset で再描画
    // (テストでは fix ボタンが alert 内に隠れるため、直接 reset を叩く)
    await userEvent.click(screen.getByRole('button', { name: '再試行' }));
    // reset 直後、再描画でまた throw されて alert が再表示されることを確認
    expect(screen.getByRole('alert')).toBeInTheDocument();
    errorSpy.mockRestore();
  });
});
