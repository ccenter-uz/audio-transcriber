import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './index';
import { AuthContext } from '@/shared/lib/auth';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { LoginResponse } from '@/shared/api/authApi';

// Mock useAuthMutation hook
vi.mock('@/features/auth/hooks/useAuthMutation', () => ({
  useAuthMutation: () => {
    const mockMutate = vi.fn().mockImplementation(async (data) => {
      if (data.login === 'testuser' && data.password === 'password123') {
        return {
          access_token: 'test-token',
          user: { id: '1', name: 'Test User', role: 'transcriber', image: null }
        } as unknown as LoginResponse;
      }
      throw new Error('Invalid credentials');
    });

    return {
      mutate: mockMutate,
      isPending: false,
      error: null
    };
  }
}));

const mockAuthContext = {
  user: null,
  token: null,
  isAuthenticated: false,
  login: vi.fn(),
  logout: vi.fn(),
};

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = (await vi.importActual('react-router-dom')) as object;
  return {
    ...(actual || {}),
    useNavigate: () => mockNavigate,
  };
});

const renderLoginPage = (isAuthenticated = false) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{
        ...mockAuthContext,
        isAuthenticated
      }}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render login form', () => {
    renderLoginPage();
    expect(screen.getByLabelText(/ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Parol/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kirish/i })).toBeInTheDocument();
  });

  it('should handle successful login', async () => {
    renderLoginPage();
    
    await act(async () => {
      await userEvent.type(screen.getByLabelText(/ID/i), 'testuser');
      await userEvent.type(screen.getByLabelText(/Parol/i), 'password123');
      await userEvent.click(screen.getByRole('button', { name: /Kirish/i }));
    });

    await waitFor(() => {
      expect(mockAuthContext.login).toHaveBeenCalledWith('test-token');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('should show validation errors for empty fields', async () => {
    renderLoginPage();
    
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /Kirish/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/Iltimos, foydalanuvchi ID'sini kiriting/i)).toBeInTheDocument();
      expect(screen.getByText(/Iltimos, parolingizni kiriting/i)).toBeInTheDocument();
    });
  });

  it('should redirect if already authenticated', async () => {
    renderLoginPage(true);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });
});