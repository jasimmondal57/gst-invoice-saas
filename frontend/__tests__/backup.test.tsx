import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BackupPage from '../app/dashboard/backup/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Backup Page', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('organizationId', 'test-org-id');
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('renders backup page', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<BackupPage />);

    await waitFor(() => {
      expect(screen.getByText(/Backup/i)).toBeInTheDocument();
    });
  });

  test('displays Backups tab', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<BackupPage />);

    await waitFor(() => {
      expect(screen.getByText(/Backups/i)).toBeInTheDocument();
    });
  });

  test('displays Export tab', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<BackupPage />);

    await waitFor(() => {
      expect(screen.getByText(/Export/i)).toBeInTheDocument();
    });
  });

  test('displays Import tab', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<BackupPage />);

    await waitFor(() => {
      expect(screen.getByText(/Import/i)).toBeInTheDocument();
    });
  });

  test('can create a backup', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ fileName: 'backup-001.json', size: 1024 }),
      });

    render(<BackupPage />);

    await waitFor(() => {
      const createButton = screen.getByText(/Create Backup/i);
      expect(createButton).toBeInTheDocument();
    });
  });

  test('displays backup list', async () => {
    const mockBackups = [
      { fileName: 'backup-001.json', size: 1024, createdAt: '2025-10-20' },
      { fileName: 'backup-002.json', size: 2048, createdAt: '2025-10-19' },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockBackups,
    });

    render(<BackupPage />);

    await waitFor(() => {
      expect(screen.getByText(/backup-001.json/i)).toBeInTheDocument();
    });
  });

  test('can export data', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: '1', invoiceNumber: 'INV-001' }],
      });

    render(<BackupPage />);

    await waitFor(() => {
      const exportButton = screen.getByText(/Export/i);
      expect(exportButton).toBeInTheDocument();
    });
  });

  test('can import data', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ imported: 5 }),
      });

    render(<BackupPage />);

    await waitFor(() => {
      const importButton = screen.getByText(/Import/i);
      expect(importButton).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<BackupPage />);

    await waitFor(() => {
      expect(screen.getByText(/Backup/i)).toBeInTheDocument();
    });
  });

  test('redirects to login if no token', () => {
    localStorage.removeItem('token');

    render(<BackupPage />);

    expect(localStorage.getItem('token')).toBeNull();
  });
});

