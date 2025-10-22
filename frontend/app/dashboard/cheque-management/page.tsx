'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, Card, CardHeader, StatusBadge } from '@/components/VyapaarComponents';

interface Cheque {
  id: string;
  chequeNumber: string;
  amount: number;
  date: string;
  payee: string;
  status: string;
  bank: string;
}

export default function ChequeManagementPage() {
  const router = useRouter();
  const [cheques, setCheques] = useState<Cheque[]>([]);
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
    fetchCheques(authToken);
  }, [router]);

  const fetchCheques = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/cheques', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCheques(data);
      }
    } catch (error) {
      console.error('Failed to fetch cheques:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCheques = cheques.filter(c => filterStatus === 'ALL' || c.status === filterStatus);
  const totalAmount = filteredCheques.reduce((sum, c) => sum + c.amount, 0);

  return (
    <VyapaarPage
      title="Cheque Management"
      subtitle="Track issued and received cheques"
      loading={loading}
      action={
        <PrimaryButton onClick={() => router.push('/dashboard/cheque-management/create')}>
          + Issue Cheque
        </PrimaryButton>
      }
      filters={
        <div className="flex gap-2">
          {['ALL', 'ISSUED', 'CLEARED', 'BOUNCED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap"
              style={{
                backgroundColor: filterStatus === status ? 'var(--primary)' : 'var(--white)',
                color: filterStatus === status ? 'white' : 'var(--text-gray)',
                borderColor: filterStatus === status ? 'var(--primary)' : 'var(--border-gray)',
                border: '1px solid',
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
          <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Total Cheque Amount</p>
          <p className="text-3xl font-bold mt-2" style={{ color: 'var(--primary)' }}>₹{totalAmount.toLocaleString('en-IN')}</p>
        </div>
      </Card>

      {/* Cheques List */}
      {filteredCheques.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">🏦</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-dark)' }}>No cheques</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>Issue or record cheques here</p>
          <PrimaryButton onClick={() => router.push('/dashboard/cheque-management/create')}>Issue Cheque</PrimaryButton>
        </Card>
      ) : (
        <Card>
          <CardHeader title={`Cheques (${filteredCheques.length})`} subtitle="Cheque details and status" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--light-gray)', borderBottom: '1px solid var(--border-gray)' }}>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Cheque #</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Payee</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Bank</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCheques.map((cheque) => (
                  <tr key={cheque.id} className="border-b hover:bg-gray-50 cursor-pointer" style={{ borderColor: 'var(--border-gray)' }} onClick={() => router.push(`/dashboard/cheque-management/${cheque.id}`)}>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-dark)' }}>{cheque.chequeNumber}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-dark)' }}>{cheque.payee}</td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>₹{cheque.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{new Date(cheque.date).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{cheque.bank}</td>
                    <td className="px-4 py-3 text-sm"><StatusBadge status={cheque.status} /></td>
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
