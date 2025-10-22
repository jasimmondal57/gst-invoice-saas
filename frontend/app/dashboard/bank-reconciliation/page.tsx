'use client';

import { useState, useEffect } from 'react';

interface BankReconciliation {
  id: string;
  bankAccount: string;
  statementDate: string;
  openingBalance: number;
  closingBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  status: string;
  notes: string;
}

interface BankTransaction {
  id: string;
  transactionDate: string;
  description: string;
  amount: number;
  type: string;
  referenceNo: string;
  matched: boolean;
}

export default function BankReconciliationPage() {
  const [reconciliations, setReconciliations] = useState<BankReconciliation[]>([]);
  const [selectedReconciliation, setSelectedReconciliation] = useState<BankReconciliation | null>(null);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    bankAccount: '',
    statementDate: '',
    openingBalance: 0,
    closingBalance: 0,
    notes: '',
  });

  useEffect(() => {
    fetchReconciliations();
  }, []);

  const fetchReconciliations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const organizationId = localStorage.getItem('organizationId');

      const response = await fetch('http://localhost:5000/api/v1/bank-reconciliation', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ organizationId }),
      });

      if (response.ok) {
        const data = await response.json();
        setReconciliations(data);
        setError('');
      }
    } catch (err) {
      console.error('Error fetching reconciliations:', err);
      setError('Failed to load reconciliations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReconciliation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const organizationId = localStorage.getItem('organizationId');

      const response = await fetch('http://localhost:5000/api/v1/bank-reconciliation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
          ...formData,
        }),
      });

      if (response.ok) {
        setFormData({
          bankAccount: '',
          statementDate: '',
          openingBalance: 0,
          closingBalance: 0,
          notes: '',
        });
        setShowForm(false);
        fetchReconciliations();
      }
    } catch (err) {
      console.error('Error creating reconciliation:', err);
      setError('Failed to create reconciliation');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      DISCREPANCY: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bank Reconciliation</h1>
            <p className="text-gray-600 mt-2">Match bank statements with your records</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'New Reconciliation'}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Create Bank Reconciliation</h2>
            <form onSubmit={handleCreateReconciliation} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
                  <input
                    type="text"
                    value={formData.bankAccount}
                    onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statement Date</label>
                  <input
                    type="date"
                    value={formData.statementDate}
                    onChange={(e) => setFormData({ ...formData, statementDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opening Balance</label>
                  <input
                    type="number"
                    value={formData.openingBalance}
                    onChange={(e) => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Closing Balance</label>
                  <input
                    type="number"
                    value={formData.closingBalance}
                    onChange={(e) => setFormData({ ...formData, closingBalance: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Reconciliation
              </button>
            </form>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Reconciliations List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : reconciliations.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No reconciliations found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Bank Account</th>
                    <th className="px-6 py-3 text-left font-semibold">Statement Date</th>
                    <th className="px-6 py-3 text-left font-semibold">Opening Balance</th>
                    <th className="px-6 py-3 text-left font-semibold">Closing Balance</th>
                    <th className="px-6 py-3 text-left font-semibold">Deposits</th>
                    <th className="px-6 py-3 text-left font-semibold">Withdrawals</th>
                    <th className="px-6 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reconciliations.map((recon) => (
                    <tr key={recon.id} className="border-b hover:bg-gray-50 cursor-pointer">
                      <td className="px-6 py-3 font-medium">{recon.bankAccount}</td>
                      <td className="px-6 py-3">{new Date(recon.statementDate).toLocaleDateString()}</td>
                      <td className="px-6 py-3">₹{recon.openingBalance.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-3">₹{recon.closingBalance.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-3">₹{recon.totalDeposits.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-3">₹{recon.totalWithdrawals.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(recon.status)}`}>
                          {recon.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        {reconciliations.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mt-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm">Total Reconciliations</div>
              <div className="text-3xl font-bold text-blue-600">{reconciliations.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm">Completed</div>
              <div className="text-3xl font-bold text-green-600">
                {reconciliations.filter((r) => r.status === 'COMPLETED').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm">Pending</div>
              <div className="text-3xl font-bold text-yellow-600">
                {reconciliations.filter((r) => r.status === 'PENDING').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm">Discrepancies</div>
              <div className="text-3xl font-bold text-red-600">
                {reconciliations.filter((r) => r.status === 'DISCREPANCY').length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

