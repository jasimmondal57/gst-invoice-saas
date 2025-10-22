'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, Card, CardHeader } from '@/components/VyapaarComponents';

interface AccountingData {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  accounts: Array<{ name: string; balance: number; type: string }>;
}

export default function AccountingPage() {
  const router = useRouter();
  const [data, setData] = useState<AccountingData>({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    accounts: [],
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      router.push('/login');
      return;
    }
    setToken(authToken);
    fetchAccountingData(authToken);
  }, [router]);

  const fetchAccountingData = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/accounting', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch accounting data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VyapaarPage
      title="Accounting"
      subtitle="View financial statements and account balances"
      loading={loading}
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Total Income</p>
            <p className="text-2xl font-bold mt-2" style={{ color: 'var(--success)' }}>₹{data.totalIncome.toLocaleString('en-IN')}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Total Expenses</p>
            <p className="text-2xl font-bold mt-2" style={{ color: 'var(--error)' }}>₹{data.totalExpenses.toLocaleString('en-IN')}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Net Profit</p>
            <p className="text-2xl font-bold mt-2" style={{ color: data.netProfit >= 0 ? 'var(--success)' : 'var(--error)' }}>₹{data.netProfit.toLocaleString('en-IN')}</p>
          </div>
        </Card>
      </div>

      {/* Accounts */}
      <Card>
        <CardHeader title="Chart of Accounts" subtitle="All account balances" />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: 'var(--light-gray)', borderBottom: '1px solid var(--border-gray)' }}>
                <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Account Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {data.accounts.map((account, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50" style={{ borderColor: 'var(--border-gray)' }}>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-dark)' }}>{account.name}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{account.type}</td>
                  <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>₹{account.balance.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </VyapaarPage>
  );
}