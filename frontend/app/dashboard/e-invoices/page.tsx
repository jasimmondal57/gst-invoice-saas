'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, Card, CardHeader, StatusBadge } from '@/components/VyapaarComponents';

interface EInvoice {
  id: string;
  invoiceNumber: string;
  ackNumber: string;
  customer: string;
  amount: number;
  status: string;
  generatedDate: string;
}

export default function EInvoicesPage() {
  const router = useRouter();
  const [eInvoices, setEInvoices] = useState<EInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      router.push('/login');
      return;
    }
    setToken(authToken);
    fetchEInvoices(authToken);
  }, [router]);

  const fetchEInvoices = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/e-invoices', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setEInvoices(data);
      }
    } catch (error) {
      console.error('Failed to fetch e-invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEInvoices = eInvoices.filter(e => filterStatus === 'ALL' || e.status === filterStatus);
  const totalAmount = filteredEInvoices.reduce((sum, e) => sum + e.amount, 0);

  return (
    <VyapaarPage
      title="E-Invoices"
      subtitle="Generate and track GST e-invoices"
      loading={loading}
      action={
        <PrimaryButton onClick={() => router.push('/dashboard/invoices/create')}>
          + Generate E-Invoice
        </PrimaryButton>
      }
      filters={
        <div className="flex gap-2">
          {['ALL', 'GENERATED', 'ACKNOWLEDGED', 'FAILED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap"
              style={{
                backgroundColor: filterStatus === status ? 'var(--primary)' : 'var(--white)',
                color: filterStatus === status ? 'white' : 'var(--text-gray)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: filterStatus === status ? 'var(--primary)' : 'var(--border-gray)',
              }}
            >
              {status}
            </button>
          ))}
        </div>
      }
    >
      {/* Summary Card */}
      <Card className="mb-6">
        <div className="p-6">
          <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Total E-Invoice Amount</p>
          <p className="text-3xl font-bold mt-2" style={{ color: 'var(--primary)' }}>₹{totalAmount.toLocaleString('en-IN')}</p>
        </div>
      </Card>

      {/* E-Invoices List */}
      {filteredEInvoices.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-dark)' }}>No e-invoices</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>Generate e-invoices for GST compliance</p>
          <PrimaryButton onClick={() => router.push('/dashboard/invoices/create')}>Generate E-Invoice</PrimaryButton>
        </Card>
      ) : (
        <Card>
          <CardHeader title={`E-Invoices (${filteredEInvoices.length})`} subtitle="GST e-invoice details" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--light-gray)', borderBottom: '1px solid var(--border-gray)' }}>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Invoice #</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>ACK #</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEInvoices.map((eInvoice) => (
                  <tr key={eInvoice.id} className="border-b hover:bg-gray-50 cursor-pointer" style={{ borderColor: 'var(--border-gray)' }} onClick={() => router.push(`/dashboard/invoices/${eInvoice.id}`)}>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-dark)' }}>{eInvoice.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{eInvoice.ackNumber || '-'}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-dark)' }}>{eInvoice.customer}</td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>₹{eInvoice.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{new Date(eInvoice.generatedDate).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm"><StatusBadge status={eInvoice.status} /></td>
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
