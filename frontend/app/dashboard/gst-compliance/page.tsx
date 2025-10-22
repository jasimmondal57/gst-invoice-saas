'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, Card, CardHeader } from '@/components/VyapaarComponents';

interface GSTReport {
  period: string;
  gstr1: { status: string; dueDate: string; filedDate?: string };
  gstr2: { status: string; dueDate: string; filedDate?: string };
  gstr3b: { status: string; dueDate: string; filedDate?: string };
  totalTaxCollected: number;
  totalTaxPaid: number;
}

export default function GSTCompliancePage() {
  const router = useRouter();
  const [reports, setReports] = useState<GSTReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      router.push('/login');
      return;
    }
    setToken(authToken);
    fetchGSTReports(authToken);
  }, [router]);

  const fetchGSTReports = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/gst-compliance', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data);
        if (data.length > 0) setSelectedPeriod(data[0].period);
      }
    } catch (error) {
      console.error('Failed to fetch GST reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedReport = reports.find(r => r.period === selectedPeriod);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FILED': return 'var(--success)';
      case 'PENDING': return 'var(--warning)';
      case 'OVERDUE': return 'var(--error)';
      default: return 'var(--text-gray)';
    }
  };

  return (
    <VyapaarPage
      title="GST Compliance"
      subtitle="Track GST filings and compliance status"
      loading={loading}
    >
      {/* Period Selection */}
      <Card className="mb-6">
        <div className="p-6">
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-dark)' }}>Select Period</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border"
            style={{ borderColor: 'var(--border-gray)' }}
          >
            {reports.map((report) => (
              <option key={report.period} value={report.period}>{report.period}</option>
            ))}
          </select>
        </div>
      </Card>

      {selectedReport && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <div className="p-6">
                <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Total Tax Collected</p>
                <p className="text-2xl font-bold mt-2" style={{ color: 'var(--success)' }}>₹{selectedReport.totalTaxCollected.toLocaleString('en-IN')}</p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Total Tax Paid</p>
                <p className="text-2xl font-bold mt-2" style={{ color: 'var(--primary)' }}>₹{selectedReport.totalTaxPaid.toLocaleString('en-IN')}</p>
              </div>
            </Card>
          </div>

          {/* GST Forms Status */}
          <Card>
            <CardHeader title="GST Forms Status" subtitle={`For period: ${selectedReport.period}`} />
            <div className="space-y-4 p-6">
              {/* GSTR-1 */}
              <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border-gray)' }}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold" style={{ color: 'var(--text-dark)' }}>GSTR-1 (Outward Supplies)</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: getStatusColor(selectedReport.gstr1.status) + '20', color: getStatusColor(selectedReport.gstr1.status) }}>
                    {selectedReport.gstr1.status}
                  </span>
                </div>
                <p className="text-sm mb-2" style={{ color: 'var(--text-gray)' }}>Due Date: {new Date(selectedReport.gstr1.dueDate).toLocaleDateString('en-IN')}</p>
                {selectedReport.gstr1.filedDate && (
                  <p className="text-sm" style={{ color: 'var(--success)' }}>Filed on: {new Date(selectedReport.gstr1.filedDate).toLocaleDateString('en-IN')}</p>
                )}
                <PrimaryButton className="mt-3">View Details</PrimaryButton>
              </div>

              {/* GSTR-2 */}
              <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border-gray)' }}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold" style={{ color: 'var(--text-dark)' }}>GSTR-2 (Inward Supplies)</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: getStatusColor(selectedReport.gstr2.status) + '20', color: getStatusColor(selectedReport.gstr2.status) }}>
                    {selectedReport.gstr2.status}
                  </span>
                </div>
                <p className="text-sm mb-2" style={{ color: 'var(--text-gray)' }}>Due Date: {new Date(selectedReport.gstr2.dueDate).toLocaleDateString('en-IN')}</p>
                {selectedReport.gstr2.filedDate && (
                  <p className="text-sm" style={{ color: 'var(--success)' }}>Filed on: {new Date(selectedReport.gstr2.filedDate).toLocaleDateString('en-IN')}</p>
                )}
                <PrimaryButton className="mt-3">View Details</PrimaryButton>
              </div>

              {/* GSTR-3B */}
              <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border-gray)' }}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold" style={{ color: 'var(--text-dark)' }}>GSTR-3B (Monthly Return)</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: getStatusColor(selectedReport.gstr3b.status) + '20', color: getStatusColor(selectedReport.gstr3b.status) }}>
                    {selectedReport.gstr3b.status}
                  </span>
                </div>
                <p className="text-sm mb-2" style={{ color: 'var(--text-gray)' }}>Due Date: {new Date(selectedReport.gstr3b.dueDate).toLocaleDateString('en-IN')}</p>
                {selectedReport.gstr3b.filedDate && (
                  <p className="text-sm" style={{ color: 'var(--success)' }}>Filed on: {new Date(selectedReport.gstr3b.filedDate).toLocaleDateString('en-IN')}</p>
                )}
                <PrimaryButton className="mt-3">View Details</PrimaryButton>
              </div>
            </div>
          </Card>
        </>
      )}
    </VyapaarPage>
  );
}

interface GSTReport {
  id: string;
  month: number;
  year: number;
  status: string;
  totalTaxableValue: number;
  totalTax: number;
}

export default function GSTCompliancePage() {
  const [activeTab, setActiveTab] = useState('gstr1');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [gstr1, setGstr1] = useState<GSTReport | null>(null);
  const [gstr2, setGstr2] = useState<GSTReport | null>(null);
  const [gstr3b, setGstr3b] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateReport = async (reportType: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const organizationId = localStorage.getItem('organizationId');

      const endpoint = `/api/v1/gst-compliance/${reportType}/generate`;
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ organizationId, month, year }),
      });

      if (response.ok) {
        const data = await response.json();
        if (reportType === 'gstr1') setGstr1(data);
        else if (reportType === 'gstr2') setGstr2(data);
        else if (reportType === 'gstr3b') setGstr3b(data);
        setError('');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'gstr1' && gstr1 === null) generateReport('gstr1');
    else if (activeTab === 'gstr2' && gstr2 === null) generateReport('gstr2');
    else if (activeTab === 'gstr3b' && gstr3b === null) generateReport('gstr3b');
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">GST Compliance</h1>
          <p className="text-gray-600 mt-2">Generate GSTR reports and E-Invoices</p>
        </div>

        {/* Month/Year Selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <option key={i} value={new Date().getFullYear() - i}>
                    {new Date().getFullYear() - i}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="flex border-b border-gray-200">
            {['gstr1', 'gstr2', 'gstr3b', 'einvoice'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'gstr1' && 'GSTR-1'}
                {tab === 'gstr2' && 'GSTR-2'}
                {tab === 'gstr3b' && 'GSTR-3B'}
                {tab === 'einvoice' && 'E-Invoice'}
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

            {/* GSTR-1 */}
            {activeTab === 'gstr1' && (
              <div>
                <button
                  onClick={() => generateReport('gstr1')}
                  disabled={loading}
                  className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Generating...' : 'Generate GSTR-1'}
                </button>

                {gstr1 && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-gray-600 text-sm">B2B Supplies</div>
                      <div className="text-2xl font-bold text-blue-600">{gstr1.b2bSupplies}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-gray-600 text-sm">B2C Supplies</div>
                      <div className="text-2xl font-bold text-green-600">{gstr1.b2cSupplies}</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-gray-600 text-sm">Total Taxable Value</div>
                      <div className="text-2xl font-bold text-purple-600">
                        ₹{gstr1.totalTaxableValue.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-gray-600 text-sm">Total Tax</div>
                      <div className="text-2xl font-bold text-orange-600">
                        ₹{gstr1.totalTax.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* GSTR-2 */}
            {activeTab === 'gstr2' && (
              <div>
                <button
                  onClick={() => generateReport('gstr2')}
                  disabled={loading}
                  className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Generating...' : 'Generate GSTR-2'}
                </button>

                {gstr2 && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-gray-600 text-sm">B2B Purchases</div>
                      <div className="text-2xl font-bold text-blue-600">{gstr2.b2bPurchases}</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-gray-600 text-sm">Total Taxable Value</div>
                      <div className="text-2xl font-bold text-purple-600">
                        ₹{gstr2.totalTaxableValue.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg col-span-2">
                      <div className="text-gray-600 text-sm">Total Tax</div>
                      <div className="text-2xl font-bold text-orange-600">
                        ₹{gstr2.totalTax.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* GSTR-3B */}
            {activeTab === 'gstr3b' && (
              <div>
                <button
                  onClick={() => generateReport('gstr3b')}
                  disabled={loading}
                  className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Generating...' : 'Generate GSTR-3B'}
                </button>

                {gstr3b && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-gray-600 text-sm">Outward Supplies</div>
                      <div className="text-2xl font-bold text-blue-600">
                        ₹{gstr3b.outwardSupplies.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-gray-600 text-sm">Inward Supplies</div>
                      <div className="text-2xl font-bold text-green-600">
                        ₹{gstr3b.inwardSupplies.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-gray-600 text-sm">ITC Available</div>
                      <div className="text-2xl font-bold text-purple-600">
                        ₹{gstr3b.itcAvailable.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-gray-600 text-sm">Tax Payable</div>
                      <div className="text-2xl font-bold text-red-600">
                        ₹{gstr3b.taxPayable.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* E-Invoice */}
            {activeTab === 'einvoice' && (
              <div>
                <p className="text-gray-600">E-Invoices are generated automatically when you create invoices.</p>
                <p className="text-gray-600 mt-2">Each invoice gets a unique IRN and QR code for GST compliance.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

