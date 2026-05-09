import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { UserAdminPage } from '../../features/admin/pages/UserAdminPage';
import { authApi } from '../../features/auth/api/auth';
import { tokenStorage } from '../../lib/apiClient';
import { server } from '../setup';
import { renderWithAuth } from '../utils';

const API = 'http://localhost:8080/api';

async function loginAdmin() {
  const { token } = await authApi.login({
    username: 'admin',
    password: 'password',
  });
  tokenStorage.set(token);
}

describe('UserAdminPage 楽観更新', () => {
  it('楽観更新 → 失敗 → ロールバック の3段階が UI に反映される', async () => {
    await loginAdmin();
    const { user } = renderWithAuth(<UserAdminPage />);
    await waitFor(() => expect(screen.getByText('user1')).toBeInTheDocument());

    // PATCH を 100ms 遅延 + 500 にして中間状態を観測可能にする
    server.use(
      http.patch(`${API}/admin/users/:userId`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({ message: 'fail' }, { status: 500 });
      }),
    );

    const user1Toggle = screen.getByRole('checkbox', {
      name: 'user1 の有効状態',
    });
    expect(user1Toggle).toBeChecked(); // 初期 true
    await user.click(user1Toggle);

    // 中間: 楽観更新で false になる
    await waitFor(() => expect(user1Toggle).not.toBeChecked());

    // 失敗後: ロールバックで true に戻り Alert 表示
    await waitFor(() => expect(user1Toggle).toBeChecked());
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});
