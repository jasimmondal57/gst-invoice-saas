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
