'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, Card, CardHeader } from '@/components/VyapaarComponents';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export default function ExpensesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      router.push('/login');
      return;
    }
    setToken(authToken);
    fetchExpenses(authToken);
  }, [router]);

  const fetchExpenses = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/expenses', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <VyapaarPage
      title="Expenses"
      subtitle="Track and manage business expenses"
      loading={loading}
      action={
        <PrimaryButton onClick={() => router.push('/dashboard/expenses/create')}>
          + Add Expense
        </PrimaryButton>
      }
    >
      {/* Summary Card */}
      <Card className="mb-6">
        <div className="p-6">
          <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Total Expenses</p>
          <p className="text-3xl font-bold mt-2" style={{ color: 'var(--error)' }}>₹{totalExpenses.toLocaleString('en-IN')}</p>
        </div>
      </Card>

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">💸</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-dark)' }}>No expenses</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>Add expenses to track spending</p>
          <PrimaryButton onClick={() => router.push('/dashboard/expenses/create')}>Add Expense</PrimaryButton>
        </Card>
      ) : (
        <Card>
          <CardHeader title={`Expenses (${expenses.length})`} subtitle="All business expenses" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--light-gray)', borderBottom: '1px solid var(--border-gray)' }}>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Description</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b hover:bg-gray-50" style={{ borderColor: 'var(--border-gray)' }}>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-dark)' }}>{expense.description}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{expense.category}</td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--error)' }}>₹{expense.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{new Date(expense.date).toLocaleDateString('en-IN')}</td>
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
