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

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  openingBalance: number;
  status: string;
}

interface JournalEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  description: string;
  totalDebit: number;
  totalCredit: number;
  status: string;
}

export default function AccountingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('accounts');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({
    code: '',
    name: '',
    type: 'ASSET',
    openingBalance: 0,
  });

  useEffect(() => {
    fetchAccounts();
    fetchJournalEntries();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const organizationId = localStorage.getItem('organizationId');

      const response = await fetch('http://localhost:5000/api/v1/accounting/accounts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ organizationId }),
      });

      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const fetchJournalEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      const organizationId = localStorage.getItem('organizationId');

      const response = await fetch('http://localhost:5000/api/v1/accounting/journal-entries', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ organizationId }),
      });

      if (response.ok) {
        const data = await response.json();
        setJournalEntries(data);
      }
    } catch (err) {
      console.error('Error fetching journal entries:', err);
    }
  };

  const handleCreateAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const organizationId = localStorage.getItem('organizationId');

      const response = await fetch('http://localhost:5000/api/v1/accounting/accounts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          organizationId,
          ...newAccount,
        }),
      });

      if (response.ok) {
        setShowNewAccount(false);
        setNewAccount({ code: '', name: '', type: 'ASSET', openingBalance: 0 });
        fetchAccounts();
      }
    } catch (err) {
      console.error('Error creating account:', err);
      setError('Failed to create account');
    }
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      ASSET: 'bg-blue-100 text-blue-800',
      LIABILITY: 'bg-red-100 text-red-800',
      EQUITY: 'bg-green-100 text-green-800',
      REVENUE: 'bg-purple-100 text-purple-800',
      EXPENSE: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Accounting Module</h1>
          <p className="text-gray-600 mt-2">Manage chart of accounts, journal entries, and ledgers</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="flex border-b border-gray-200">
            {['accounts', 'journal', 'ledger'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'accounts' && 'Chart of Accounts'}
                {tab === 'journal' && 'Journal Entries'}
                {tab === 'ledger' && 'Ledger'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Chart of Accounts Tab */}
            {activeTab === 'accounts' && (
              <div>
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Chart of Accounts</h2>
                  <button
                    onClick={() => setShowNewAccount(!showNewAccount)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    + New Account
                  </button>
                </div>

                {showNewAccount && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        placeholder="Account Code"
                        value={newAccount.code}
                        onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Account Name"
                        value={newAccount.name}
                        onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={newAccount.type}
                        onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="ASSET">Asset</option>
                        <option value="LIABILITY">Liability</option>
                        <option value="EQUITY">Equity</option>
                        <option value="REVENUE">Revenue</option>
                        <option value="EXPENSE">Expense</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Opening Balance"
                        value={newAccount.openingBalance}
                        onChange={(e) => setNewAccount({ ...newAccount, openingBalance: parseFloat(e.target.value) })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateAccount}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => setShowNewAccount(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">Code</th>
                          <th className="px-4 py-2 text-left font-semibold">Name</th>
                          <th className="px-4 py-2 text-left font-semibold">Type</th>
                          <th className="px-4 py-2 text-left font-semibold">Opening Balance</th>
                          <th className="px-4 py-2 text-left font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accounts.map((account) => (
                          <tr key={account.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium">{account.code}</td>
                            <td className="px-4 py-2">{account.name}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(account.type)}`}>
                                {account.type}
                              </span>
                            </td>
                            <td className="px-4 py-2">₹{account.openingBalance.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                                {account.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Journal Entries Tab */}
            {activeTab === 'journal' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Journal Entries</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold">Entry #</th>
                        <th className="px-4 py-2 text-left font-semibold">Date</th>
                        <th className="px-4 py-2 text-left font-semibold">Description</th>
                        <th className="px-4 py-2 text-left font-semibold">Debit</th>
                        <th className="px-4 py-2 text-left font-semibold">Credit</th>
                        <th className="px-4 py-2 text-left font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {journalEntries.map((entry) => (
                        <tr key={entry.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium">{entry.entryNumber}</td>
                          <td className="px-4 py-2">{new Date(entry.entryDate).toLocaleDateString()}</td>
                          <td className="px-4 py-2">{entry.description}</td>
                          <td className="px-4 py-2">₹{entry.totalDebit.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-2">₹{entry.totalCredit.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              entry.status === 'POSTED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {entry.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Ledger Tab */}
            {activeTab === 'ledger' && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Ledger</h2>
                <p className="text-gray-600">Select an account from Chart of Accounts to view its ledger</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

