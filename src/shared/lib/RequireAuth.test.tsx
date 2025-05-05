import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RequireAuth } from './RequireAuth';
import { AuthContext, UserRole } from './auth';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const mockAuthContext = {
  user: null,
  token: null,
  isAuthenticated: false,
  login: vi.fn(),
  logout: vi.fn(),
};

const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;

const renderWithRouter = (
  component: React.ReactNode,
  initialPath = '/',
  authenticated = false,
  userRole?: string
) => {
  const authContext = authenticated
    ? {
        ...mockAuthContext,
        isAuthenticated: true,
        user: { id: '1', role: userRole as UserRole || 'user' as UserRole },
      }
    : mockAuthContext;

  return render(
    <AuthContext.Provider value={authContext}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
          <Route path="/" element={component} />
          <Route path="/protected" element={component} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('RequireAuth', () => {
  it('should redirect to login when not authenticated', () => {
    renderWithRouter(
      <RequireAuth>
        <TestComponent />
      </RequireAuth>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('should render children when authenticated with no role requirement', () => {
    renderWithRouter(
      <RequireAuth>
        <TestComponent />
      </RequireAuth>,
      '/',
      true
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should allow access when user has required role', () => {
    renderWithRouter(
      <RequireAuth role="admin">
        <TestComponent />
      </RequireAuth>,
      '/',
      true,
      'admin'
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should redirect to dashboard when user has wrong role', () => {
    renderWithRouter(
      <RequireAuth role="admin">
        <TestComponent />
      </RequireAuth>,
      '/protected',
      true,
      'operator'
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

  it('should allow access when user has one of multiple required roles', () => {
    renderWithRouter(
      <RequireAuth role={['admin', 'transcriber']}>
        <TestComponent />
      </RequireAuth>,
      '/',
      true,
      'operator'
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
});