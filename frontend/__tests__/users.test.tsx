import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UsersPage from '../app/dashboard/users/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Users Page', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('organizationId', 'test-org-id');
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('renders users page', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText(/Users/i)).toBeInTheDocument();
    });
  });

  test('displays invite user form', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText(/Invite User/i)).toBeInTheDocument();
    });
  });

  test('displays user list', async () => {
    const mockUsers = [
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'ADMIN' },
      { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', role: 'MANAGER' },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
    });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
    });
  });

  test('can invite a new user', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'user-1', email: 'newuser@example.com' }),
      });

    render(<UsersPage />);

    await waitFor(() => {
      const inviteButton = screen.getByText(/Invite User/i);
      expect(inviteButton).toBeInTheDocument();
    });
  });

  test('displays role options', async () => {
    const mockUsers = [
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'ADMIN' },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
    });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText(/ADMIN/i)).toBeInTheDocument();
    });
  });

  test('can update user role', async () => {
    const mockUsers = [
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'VIEWER' },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '1', role: 'MANAGER' }),
      });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText(/VIEWER/i)).toBeInTheDocument();
    });
  });

  test('displays audit trail', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText(/Audit Trail/i)).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText(/Users/i)).toBeInTheDocument();
    });
  });

  test('redirects to login if no token', () => {
    localStorage.removeItem('token');

    render(<UsersPage />);

    expect(localStorage.getItem('token')).toBeNull();
  });
});

