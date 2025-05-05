import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './auth.tsx';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock JWT token parsing
vi.mock('./auth', async () => {
  const actual = await vi.importActual('./auth');
  return {
    ...(actual as object),
    parseToken: vi.fn((token) => {
      if (token === 'valid-token') {
        return { id: '1', role: 'admin' };
      }
      if (token === 'test-token') {
        return { id: '2', role: 'user' };
      }
      throw new Error('Invalid token format');
    }),
  };
});

const TestComponent = () => {
  const { isAuthenticated, user } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user-info">{user?.role || 'no-user'}</div>
    </div>
  );
};

describe('AuthProvider and useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should provide initial unauthenticated state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user-info')).toHaveTextContent('no-user');
  });

  it('should update auth state on login', async () => {
    const TestLogin = () => {
      const { login } = useAuth();
      return <button onClick={() => login('test-token')}>Login</button>;
    };

    render(
      <AuthProvider>
        <TestLogin />
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Login'));
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'test-token');
  });

  it('should clear auth state on logout', async () => {
    (localStorage.getItem as vi.Mock).mockReturnValue('valid-token');

    const TestLogout = () => {
      const { logout } = useAuth();
      return <button onClick={logout}>Logout</button>;
    };

    render(
      <AuthProvider>
        <TestLogout />
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Logout'));
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
  });

  it('should restore auth state from localStorage on mount', () => {
    (localStorage.getItem as vi.Mock).mockReturnValue('valid-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user-info')).toHaveTextContent('admin');
  });

  it('should handle invalid token in localStorage', () => {
    (localStorage.getItem as vi.Mock).mockReturnValue('invalid-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
  });
});