'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader, PrimaryButton, Card, CardHeader, StatusBadge, EmptyState } from '@/components/VyapaarComponents';

interface Customer {
  id: string;
  name: string;
  type: 'B2B' | 'B2C';
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: Customer;
  totalAmount: number;
  status: string;
  invoiceDate: string;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    const orgId = localStorage.getItem('organizationId');
    if (!authToken) {
      router.push('/login');
      return;
    }
    setToken(authToken);
    fetchInvoices(authToken, orgId || '');
  }, [router]);

  const fetchInvoices = async (authToken: string, orgId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/invoices?organizationId=${orgId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = filterStatus === 'ALL' ? invoices : invoices.filter(inv => inv.status === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--light-gray)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--primary)' }}></div>
          <p style={{ color: 'var(--text-gray)' }}>Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--light-gray)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Invoices"
          subtitle="Manage all your invoices"
          action={
            <Link href="/dashboard/invoices/create">
              <PrimaryButton>+ Create Invoice</PrimaryButton>
            </Link>
          }
        />

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['ALL', 'DRAFT', 'PAID', 'SENT', 'OVERDUE'].map((status) => {
            // Display DRAFT as UNPAID in UI
            const displayStatus = status === 'DRAFT' ? 'UNPAID' : status;
            return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition"
              style={{
                backgroundColor: filterStatus === status ? 'var(--primary)' : 'var(--white)',
                color: filterStatus === status ? 'white' : 'var(--text-gray)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: filterStatus === status ? 'var(--primary)' : 'var(--border-gray)',
              }}
            >
              {displayStatus}
            </button>
            );
          })}
        </div>

        {/* Content */}
        {filteredInvoices.length === 0 ? (
          <EmptyState
            icon="📄"
            title="No invoices yet"
            description="Create your first invoice to get started"
            action={
              <Link href="/dashboard/invoices/create">
                <PrimaryButton>Create First Invoice</PrimaryButton>
              </Link>
            }
          />
        ) : (
          <Card>
            <CardHeader title={`Invoices (${filteredInvoices.length})`} subtitle="All your invoices in one place" />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: 'var(--light-gray)', borderBottom: '1px solid var(--border-gray)' }}>
                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Invoice #</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Customer</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50" style={{ borderColor: 'var(--border-gray)' }}>
                      <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--primary)' }}>
                        <Link href={`/dashboard/invoices/${invoice.id}`}>
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-dark)' }}>{invoice.customer.name}</td>
                      <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>
                        ₹{invoice.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>
                        {new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-3">
                          <Link href={`/dashboard/invoices/${invoice.id}`}>
                            <button className="font-medium transition hover:opacity-80" style={{ color: 'var(--primary)' }}>View</button>
                          </Link>
                          <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                            <button className="font-medium transition hover:opacity-80" style={{ color: 'var(--primary)' }}>Edit</button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

