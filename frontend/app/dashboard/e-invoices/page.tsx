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

interface EInvoice {
  id: string;
  invoiceNumber: string;
  irn: string;
  qrCode: string;
  status: string;
  createdAt: string;
}

export default function EInvoicesPage() {
  const router = useRouter();
  const [eInvoices, setEInvoices] = useState<EInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<EInvoice | null>(null);

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
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
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

  const generateEInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/e-invoices/generate/${invoiceId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchEInvoices(token);
      }
    } catch (error) {
      console.error('Failed to generate e-invoice:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading e-invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">E-Invoices</h1>
          <p className="text-gray-600 mt-1">Generate and manage e-invoices with IRN and QR codes</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-blue-900 mb-2">📋 E-Invoice Information</h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>✓ IRN (Invoice Reference Number) - Unique identifier for each e-invoice</li>
            <li>✓ QR Code - Contains invoice details for easy scanning</li>
            <li>✓ Mandatory for B2B invoices above ₹50,000</li>
            <li>✓ Optional for B2C invoices</li>
            <li>✓ Valid for 30 days from invoice date</li>
          </ul>
        </div>

        {/* E-Invoices List */}
        {eInvoices.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No e-invoices yet</h3>
            <p className="text-gray-700 mb-6">Generate e-invoices from your invoices</p>
            <p className="text-sm text-gray-700">Go to Invoices section and generate e-invoices for your invoices</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eInvoices.map((eInvoice) => (
              <div key={eInvoice.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{eInvoice.invoiceNumber}</h3>
                    <p className="text-sm text-gray-600">IRN: {eInvoice.irn}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    {eInvoice.status}
                  </span>
                </div>

                {/* QR Code */}
                {eInvoice.qrCode && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg flex justify-center">
                    <img src={eInvoice.qrCode} alt="QR Code" className="w-32 h-32" />
                  </div>
                )}

                <div className="text-sm text-gray-600 mb-4">
                  <p>Created: {new Date(eInvoice.createdAt).toLocaleDateString('en-IN')}</p>
                </div>

                <button
                  onClick={() => setSelectedInvoice(eInvoice)}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-sm"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">E-Invoice Details</h2>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Invoice Number</p>
                <p className="text-lg font-semibold text-gray-900">{selectedInvoice.invoiceNumber}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">IRN (Invoice Reference Number)</p>
                <p className="text-sm font-mono text-gray-900 break-all">{selectedInvoice.irn}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-semibold text-green-600">{selectedInvoice.status}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Created Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(selectedInvoice.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>

              {selectedInvoice.qrCode && (
                <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                  <img src={selectedInvoice.qrCode} alt="QR Code" className="w-40 h-40" />
                </div>
              )}

              <button
                onClick={() => setSelectedInvoice(null)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

