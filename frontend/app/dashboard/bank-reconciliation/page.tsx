'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, Card, CardHeader, StatusBadge } from '@/components/VyapaarComponents';

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  status: string;
}

export default function BankReconciliationPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [bankBalance, setBankBalance] = useState(0);
  const [bookBalance, setBookBalance] = useState(0);

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      router.push('/login');
      return;
    }
    setToken(authToken);
    fetchBankReconciliation(authToken);
  }, [router]);

  const fetchBankReconciliation = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/bank-reconciliation', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
        setBankBalance(data.bankBalance || 0);
        setBookBalance(data.bookBalance || 0);
      }
    } catch (error) {
      console.error('Failed to fetch bank reconciliation:', error);
    } finally {
      setLoading(false);
    }
  };

  const difference = Math.abs(bankBalance - bookBalance);

  return (
    <VyapaarPage
      title="Bank Reconciliation"
      subtitle="Reconcile bank statements with accounting records"
      loading={loading}
      action={
        <PrimaryButton onClick={() => router.push('/dashboard/bank-reconciliation/reconcile')}>
          + Reconcile
        </PrimaryButton>
      }
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Bank Balance</p>
            <p className="text-2xl font-bold mt-2" style={{ color: 'var(--primary)' }}>₹{bankBalance.toLocaleString('en-IN')}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Book Balance</p>
            <p className="text-2xl font-bold mt-2" style={{ color: 'var(--primary)' }}>₹{bookBalance.toLocaleString('en-IN')}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Difference</p>
            <p className="text-2xl font-bold mt-2" style={{ color: difference === 0 ? 'var(--success)' : 'var(--warning)' }}>₹{difference.toLocaleString('en-IN')}</p>
          </div>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader title="Bank Transactions" subtitle="Pending and reconciled transactions" />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: 'var(--light-gray)', borderBottom: '1px solid var(--border-gray)' }}>
                <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Description</th>
                <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b hover:bg-gray-50" style={{ borderColor: 'var(--border-gray)' }}>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{new Date(txn.date).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-dark)' }}>{txn.description}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{txn.type}</td>
                  <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>₹{txn.amount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-sm"><StatusBadge status={txn.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </VyapaarPage>
  );
}
