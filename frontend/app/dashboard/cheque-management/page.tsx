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

interface Cheque {
  id: string;
  chequeNumber: string;
  amount: number;
  payeeParty: string;
  chequeDate: string;
  status: string;
  bankAccount: string;
  notes: string;
}

export default function ChequeManagementPage() {
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    chequeNumber: '',
    amount: 0,
    payeeParty: '',
    chequeDate: '',
    bankAccount: '',
    notes: '',
  });

  useEffect(() => {
    fetchCheques();
  }, []);

  const fetchCheques = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const organizationId = localStorage.getItem('organizationId');

      const response = await fetch('http://localhost:5000/api/v1/cheques', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ organizationId }),
      });

      if (response.ok) {
        const data = await response.json();
        setCheques(data);
        setError('');
      }
    } catch (err) {
      console.error('Error fetching cheques:', err);
      setError('Failed to load cheques');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCheque = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const organizationId = localStorage.getItem('organizationId');

      const response = await fetch('http://localhost:5000/api/v1/cheques', {
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
          chequeNumber: '',
          amount: 0,
          payeeParty: '',
          chequeDate: '',
          bankAccount: '',
          notes: '',
        });
        setShowForm(false);
        fetchCheques();
      }
    } catch (err) {
      console.error('Error creating cheque:', err);
      setError('Failed to create cheque');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      ISSUED: 'bg-blue-100 text-blue-800',
      CLEARED: 'bg-green-100 text-green-800',
      BOUNCED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cheque Management</h1>
            <p className="text-gray-600 mt-2">Track and manage cheques issued and received</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'New Cheque'}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Issue New Cheque</h2>
            <form onSubmit={handleCreateCheque} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cheque Number</label>
                  <input
                    type="text"
                    value={formData.chequeNumber}
                    onChange={(e) => setFormData({ ...formData, chequeNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payee Party</label>
                  <input
                    type="text"
                    value={formData.payeeParty}
                    onChange={(e) => setFormData({ ...formData, payeeParty: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cheque Date</label>
                  <input
                    type="date"
                    value={formData.chequeDate}
                    onChange={(e) => setFormData({ ...formData, chequeDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
                  <input
                    type="text"
                    value={formData.bankAccount}
                    onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
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
                Create Cheque
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

        {/* Cheques List */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : cheques.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No cheques found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Cheque Number</th>
                    <th className="px-6 py-3 text-left font-semibold">Payee</th>
                    <th className="px-6 py-3 text-left font-semibold">Amount</th>
                    <th className="px-6 py-3 text-left font-semibold">Cheque Date</th>
                    <th className="px-6 py-3 text-left font-semibold">Bank Account</th>
                    <th className="px-6 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cheques.map((cheque) => (
                    <tr key={cheque.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium">{cheque.chequeNumber}</td>
                      <td className="px-6 py-3">{cheque.payeeParty}</td>
                      <td className="px-6 py-3">₹{cheque.amount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-3">{new Date(cheque.chequeDate).toLocaleDateString()}</td>
                      <td className="px-6 py-3">{cheque.bankAccount}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(cheque.status)}`}>
                          {cheque.status}
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
        {cheques.length > 0 && (
          <div className="grid grid-cols-4 gap-4 mt-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm">Total Cheques</div>
              <div className="text-3xl font-bold text-blue-600">{cheques.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm">Cleared</div>
              <div className="text-3xl font-bold text-green-600">
                {cheques.filter((c) => c.status === 'CLEARED').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm">Pending</div>
              <div className="text-3xl font-bold text-yellow-600">
                {cheques.filter((c) => c.status === 'PENDING').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm">Total Amount</div>
              <div className="text-3xl font-bold text-purple-600">
                ₹{cheques.reduce((sum, c) => sum + c.amount, 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

