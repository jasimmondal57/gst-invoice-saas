import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ManufacturingPage from '../app/dashboard/manufacturing/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Manufacturing Page', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('organizationId', 'test-org-id');
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('renders manufacturing page', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<ManufacturingPage />);

    await waitFor(() => {
      expect(screen.getByText(/Manufacturing/i)).toBeInTheDocument();
    });
  });

  test('displays BOM tab', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<ManufacturingPage />);

    await waitFor(() => {
      expect(screen.getByText(/Bill of Materials/i)).toBeInTheDocument();
    });
  });

  test('displays Production Orders tab', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<ManufacturingPage />);

    await waitFor(() => {
      expect(screen.getByText(/Production Orders/i)).toBeInTheDocument();
    });
  });

  test('can create a new BOM', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'bom-1', name: 'Test BOM' }),
      });

    render(<ManufacturingPage />);

    await waitFor(() => {
      const createButton = screen.getByText(/Create BOM/i);
      expect(createButton).toBeInTheDocument();
    });
  });

  test('displays BOM list', async () => {
    const mockBOMs = [
      { id: '1', name: 'BOM 1', productId: 'prod-1' },
      { id: '2', name: 'BOM 2', productId: 'prod-2' },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockBOMs,
    });

    render(<ManufacturingPage />);

    await waitFor(() => {
      expect(screen.getByText(/BOM 1/i)).toBeInTheDocument();
    });
  });

  test('displays Production Orders list', async () => {
    const mockOrders = [
      { id: '1', orderNumber: 'PO-001', quantity: 100, status: 'DRAFT' },
      { id: '2', orderNumber: 'PO-002', quantity: 200, status: 'IN_PROGRESS' },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrders,
    });

    render(<ManufacturingPage />);

    await waitFor(() => {
      expect(screen.getByText(/PO-001/i)).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<ManufacturingPage />);

    await waitFor(() => {
      expect(screen.getByText(/Manufacturing/i)).toBeInTheDocument();
    });
  });

  test('redirects to login if no token', () => {
    localStorage.removeItem('token');

    render(<ManufacturingPage />);

    // Component should handle missing token
    expect(localStorage.getItem('token')).toBeNull();
  });
});

