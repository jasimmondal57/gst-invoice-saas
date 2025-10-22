'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { Card, CardHeader } from '@/components/VyapaarComponents';

interface Reconciliation {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  date: string;
}

export default function PaymentReconciliationPage() {
  const router = useRouter();
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      router.push('/login');
      return;
    }
    setToken(authToken);
    fetchReconciliations(authToken);
  }, [router]);

  const fetchReconciliations = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/payment-reconciliation', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setReconciliations(data);
      }
    } catch (error) {
      console.error('Failed to fetch reconciliations:', error);
    } finally {
      setLoading(false);
    }
  };

  const reconciled = reconciliations.filter(r => r.status === 'RECONCILED').length;
  const pending = reconciliations.filter(r => r.status === 'PENDING').length;

  return (
    <VyapaarPage
      title="Payment Reconciliation"
      subtitle="Reconcile payments with invoices"
      loading={loading}
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Total Transactions</p>
            <p className="text-3xl font-bold mt-2" style={{ color: 'var(--text-dark)' }}>{reconciliations.length}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Reconciled</p>
            <p className="text-3xl font-bold mt-2" style={{ color: 'var(--success)' }}>{reconciled}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Pending</p>
            <p className="text-3xl font-bold mt-2" style={{ color: 'var(--warning)' }}>{pending}</p>
          </div>
        </Card>
      </div>

      {/* Reconciliation List */}
      {reconciliations.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">🔄</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-dark)' }}>No reconciliations</h3>
          <p className="text-sm" style={{ color: 'var(--text-gray)' }}>All payments are reconciled</p>
        </Card>
      ) : (
        <Card>
          <CardHeader title={`Reconciliations (${reconciliations.length})`} subtitle="Payment reconciliation status" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--light-gray)', borderBottom: '1px solid var(--border-gray)' }}>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Invoice #</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {reconciliations.map((rec) => (
                  <tr key={rec.id} className="border-b hover:bg-gray-50" style={{ borderColor: 'var(--border-gray)' }}>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-dark)' }}>{rec.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>₹{rec.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{new Date(rec.date).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm"><span className="px-2 py-1 rounded text-xs font-semibold" style={{ backgroundColor: rec.status === 'RECONCILED' ? 'var(--success)' : 'var(--warning)', color: 'white' }}>{rec.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </VyapaarPage>
  );
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: string;
  paymentPercentage: string;
  customer: { name: string };
}

export default function PaymentReconciliationPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [outstanding, setOutstanding] = useState<any>(null);

  useEffect(() => {
    fetchInvoices();
    fetchOutstanding();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const organizationId = localStorage.getItem('organizationId');

      const url = new URL('http://localhost:5000/api/v1/payment-reconciliation/invoices');
      if (statusFilter) url.searchParams.append('status', statusFilter);

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ organizationId }),
      });

      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
        setError('');
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchOutstanding = async () => {
    try {
      const token = localStorage.getItem('token');
      const organizationId = localStorage.getItem('organizationId');

      const response = await fetch('http://localhost:5000/api/v1/payment-reconciliation/outstanding/summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ organizationId }),
      });

      if (response.ok) {
        const data = await response.json();
        setOutstanding(data.summary);
      }
    } catch (err) {
      console.error('Error fetching outstanding:', err);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PAID: 'bg-green-100 text-green-800',
      UNPAID: 'bg-red-100 text-red-800',
      PARTIAL: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage === 100) return 'bg-green-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Reconciliation</h1>
          <p className="text-gray-600 mt-2">Track and manage invoice payments</p>
        </div>

        {/* Outstanding Summary */}
        {outstanding && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm font-medium">Total Outstanding</div>
              <div className="text-3xl font-bold text-red-600 mt-2">
                ₹{outstanding.totalOutstanding.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm font-medium">Overdue Amount</div>
              <div className="text-3xl font-bold text-orange-600 mt-2">
                ₹{outstanding.overdueAmount.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm font-medium">Upcoming Amount</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">
                ₹{outstanding.upcomingAmount.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIAL">Partial</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading invoices...</p>
          </div>
        )}

        {/* Invoices Table */}
        {!loading && invoices.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Invoice</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Paid</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Pending</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Progress</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600 cursor-pointer hover:underline"
                        onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}>
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{invoice.customer.name}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                      ₹{invoice.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium">
                      ₹{invoice.paidAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600 font-medium">
                      ₹{invoice.pendingAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(parseFloat(invoice.paymentPercentage))}`}
                          style={{ width: `${invoice.paymentPercentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{invoice.paymentPercentage}%</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.paymentStatus)}`}>
                        {invoice.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!loading && invoices.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">💰</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Invoices</h3>
            <p className="text-gray-600">Create invoices to track payments</p>
          </div>
        )}
      </div>
    </div>
  );
}

