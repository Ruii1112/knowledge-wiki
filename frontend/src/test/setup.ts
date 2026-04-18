import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:8080/api';

// Mock API handlers
export const handlers = [
  http.post(`${API_BASE_URL}/auth/signup`, async () => {
    return HttpResponse.json(
      {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER',
        enabled: true,
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),
];

export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
