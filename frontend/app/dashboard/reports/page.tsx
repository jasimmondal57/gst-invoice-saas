'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, Card, CardHeader } from '@/components/VyapaarComponents';

interface ReportData {
  totalSales: number;
  totalPurchases: number;
  totalTax: number;
  totalPayments: number;
  pendingAmount: number;
}

export default function ReportsPage() {
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData>({
    totalSales: 0,
    totalPurchases: 0,
    totalTax: 0,
    totalPayments: 0,
    pendingAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [selectedReport, setSelectedReport] = useState('SALES');

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      router.push('/login');
      return;
    }
    setToken(authToken);
    fetchReportData(authToken);
  }, [router]);

  const fetchReportData = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/reports/summary', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const reports = [
    { id: 'SALES', label: 'Sales Report', icon: '📊', color: 'var(--success)' },
    { id: 'PURCHASES', label: 'Purchase Report', icon: '📦', color: 'var(--primary)' },
    { id: 'GST', label: 'GST Report', icon: '📋', color: 'var(--info)' },
    { id: 'PAYMENTS', label: 'Payment Report', icon: '💳', color: 'var(--warning)' },
  ];

  return (
    <VyapaarPage
      title="Reports"
      subtitle="View business analytics and reports"
      loading={loading}
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Total Sales</p>
            <p className="text-2xl font-bold mt-2" style={{ color: 'var(--success)' }}>₹{reportData.totalSales.toLocaleString('en-IN')}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Total Purchases</p>
            <p className="text-2xl font-bold mt-2" style={{ color: 'var(--primary)' }}>₹{reportData.totalPurchases.toLocaleString('en-IN')}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Total Tax</p>
            <p className="text-2xl font-bold mt-2" style={{ color: 'var(--info)' }}>₹{reportData.totalTax.toLocaleString('en-IN')}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Pending Amount</p>
            <p className="text-2xl font-bold mt-2" style={{ color: 'var(--warning)' }}>₹{reportData.pendingAmount.toLocaleString('en-IN')}</p>
          </div>
        </Card>
      </div>

      {/* Report Types */}
      <Card>
        <CardHeader title="Available Reports" subtitle="Select a report to view details" />
        <div className="grid grid-cols-2 gap-4 p-6">
          {reports.map((report) => (
            <div
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className="p-6 rounded-lg border-2 cursor-pointer transition hover:shadow-lg"
              style={{
                backgroundColor: selectedReport === report.id ? 'var(--light-gray)' : 'var(--white)',
                borderColor: selectedReport === report.id ? 'var(--primary)' : 'var(--border-gray)',
              }}
            >
              <div className="text-3xl mb-2">{report.icon}</div>
              <h3 className="font-semibold" style={{ color: 'var(--text-dark)' }}>{report.label}</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-gray)' }}>Click to view</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Report Details */}
      <Card className="mt-6">
        <CardHeader title={`${selectedReport} Report`} subtitle="Detailed report information" />
        <div className="p-6">
          {selectedReport === 'SALES' && (
            <div>
              <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>Total Sales Amount</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--success)' }}>₹{reportData.totalSales.toLocaleString('en-IN')}</p>
              <PrimaryButton className="mt-4" onClick={() => router.push('/dashboard/reports/sales')}>View Detailed Report</PrimaryButton>
            </div>
          )}
          {selectedReport === 'PURCHASES' && (
            <div>
              <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>Total Purchase Amount</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>₹{reportData.totalPurchases.toLocaleString('en-IN')}</p>
              <PrimaryButton className="mt-4" onClick={() => router.push('/dashboard/reports/purchase')}>View Detailed Report</PrimaryButton>
            </div>
          )}
          {selectedReport === 'GST' && (
            <div>
              <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>Total GST Collected</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--info)' }}>₹{reportData.totalTax.toLocaleString('en-IN')}</p>
              <PrimaryButton className="mt-4" onClick={() => router.push('/dashboard/gst-compliance')}>View GST Compliance</PrimaryButton>
            </div>
          )}
          {selectedReport === 'PAYMENTS' && (
            <div>
              <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>Total Payments Received</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--warning)' }}>₹{reportData.totalPayments.toLocaleString('en-IN')}</p>
              <PrimaryButton className="mt-4" onClick={() => router.push('/dashboard/payments')}>View Payment Details</PrimaryButton>
            </div>
          )}
        </div>
      </Card>
    </VyapaarPage>
  );
}

interface ReportData {
  totalInvoices?: number;
  totalRevenue?: number;
  totalGST?: number;
  totalExpenses?: number;
  pendingAmount?: number;
  paidAmount?: number;
  gstr1Data?: any;
  gstr2Data?: any;
  [key: string]: any;
}

export default function ReportsPage() {
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [activeTab, setActiveTab] = useState<'sales' | 'purchase' | 'gst' | 'pl' | 'customer' | 'supplier'>('sales');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().split('T')[0].slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    const orgId = localStorage.getItem('organizationId');
    if (!authToken) {
      router.push('/login');
      return;
    }
    setToken(authToken);
    setOrganizationId(orgId || '');
    fetchReportData(authToken, orgId || '', activeTab);
  }, [router, activeTab]);

  const fetchReportData = async (authToken: string, orgId: string, tab: string) => {
    setLoading(true);
    try {
      let url = '';
      const month = selectedMonth.split('-')[1];
      const year = selectedMonth.split('-')[0];

      switch (tab) {
        case 'sales':
          url = `http://localhost:5000/api/v1/reports/sales-report?organizationId=${orgId}&startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'purchase':
          url = `http://localhost:5000/api/v1/reports/purchase-report?organizationId=${orgId}&startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'gst':
          url = `http://localhost:5000/api/v1/reports/gstr-1?organizationId=${orgId}&month=${month}&year=${year}`;
          break;
        case 'pl':
          url = `http://localhost:5000/api/v1/reports/profit-loss?organizationId=${orgId}&startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'customer':
          url = `http://localhost:5000/api/v1/reports/customer-report?organizationId=${orgId}&startDate=${startDate}&endDate=${endDate}`;
          break;
        case 'supplier':
          url = `http://localhost:5000/api/v1/reports/supplier-report?organizationId=${orgId}&startDate=${startDate}&endDate=${endDate}`;
          break;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadGSTR1 = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/reports/gstr1?month=${selectedMonth}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GSTR-1-${selectedMonth}.json`;
        a.click();
      }
    } catch (error) {
      console.error('Failed to download GSTR-1:', error);
    }
  };

  const downloadGSTR2 = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/reports/gstr2?month=${selectedMonth}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GSTR-2-${selectedMonth}.json`;
        a.click();
      }
    } catch (error) {
      console.error('Failed to download GSTR-2:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: 'sales', label: '📊 Sales Report' },
            { id: 'purchase', label: '📦 Purchase Report' },
            { id: 'pl', label: '💹 Profit & Loss' },
            { id: 'customer', label: '👥 Customer-wise' },
            { id: 'supplier', label: '🏢 Supplier-wise' },
            { id: 'gst', label: '📋 GST Reports' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Date Range Filter */}
        {activeTab !== 'gst' && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => fetchReportData(token, organizationId, activeTab)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Generate Report
              </button>
            </div>
          </div>
        )}
        {/* Sales Report */}
        {activeTab === 'sales' && reportData && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Report</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.totalInvoices || 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{(reportData.totalRevenue || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Tax</p>
                <p className="text-2xl font-bold text-gray-900">₹{(reportData.totalTax || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
            {reportData.invoices && reportData.invoices.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-700 font-medium">Invoice #</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-medium">Date</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-medium">Customer</th>
                      <th className="px-4 py-2 text-right text-gray-700 font-medium">Amount</th>
                      <th className="px-4 py-2 text-right text-gray-700 font-medium">Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.invoices.map((inv: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-900">{inv.invoiceNumber}</td>
                        <td className="px-4 py-2 text-gray-600">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                        <td className="px-4 py-2 text-gray-600">{inv.customerName}</td>
                        <td className="px-4 py-2 text-right text-gray-900">₹{inv.amount.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-2 text-right text-gray-900">₹{inv.tax.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Purchase Report */}
        {activeTab === 'purchase' && reportData && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Purchase Report</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Purchases</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.totalPurchases || 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900">₹{(reportData.totalCost || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Tax</p>
                <p className="text-2xl font-bold text-gray-900">₹{(reportData.totalTax || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
            {reportData.purchases && reportData.purchases.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-700 font-medium">Purchase #</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-medium">Date</th>
                      <th className="px-4 py-2 text-left text-gray-700 font-medium">Supplier</th>
                      <th className="px-4 py-2 text-right text-gray-700 font-medium">Amount</th>
                      <th className="px-4 py-2 text-right text-gray-700 font-medium">Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.purchases.map((pur: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-900">{pur.purchaseNumber}</td>
                        <td className="px-4 py-2 text-gray-600">{new Date(pur.purchaseDate).toLocaleDateString()}</td>
                        <td className="px-4 py-2 text-gray-600">{pur.supplierName}</td>
                        <td className="px-4 py-2 text-right text-gray-900">₹{pur.amount.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-2 text-right text-gray-900">₹{pur.tax.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Profit & Loss */}
        {activeTab === 'pl' && reportData && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profit & Loss Statement</h2>
            <div className="space-y-4 max-w-md">
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <span className="text-gray-700">Total Revenue</span>
                <span className="font-semibold text-gray-900">₹{(reportData.totalRevenue || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-200">
                <span className="text-gray-700">Total Cost</span>
                <span className="font-semibold text-gray-900">₹{(reportData.totalCost || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pb-2 border-b-2 border-gray-300 pt-2">
                <span className="text-lg font-semibold text-gray-900">Profit/Loss</span>
                <span className={`text-lg font-bold ${reportData.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{(reportData.profit || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-gray-700">Profit Margin</span>
                <span className="font-semibold text-gray-900">{reportData.profitMargin || 0}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Customer-wise Report */}
        {activeTab === 'customer' && reportData && reportData.customers && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer-wise Report</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Customer</th>
                    <th className="px-4 py-2 text-right text-gray-700 font-medium">Invoices</th>
                    <th className="px-4 py-2 text-right text-gray-700 font-medium">Total Amount</th>
                    <th className="px-4 py-2 text-right text-gray-700 font-medium">Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.customers.map((cust: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-900">{cust.customerName}</td>
                      <td className="px-4 py-2 text-right text-gray-600">{cust.totalInvoices}</td>
                      <td className="px-4 py-2 text-right text-gray-900">₹{cust.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2 text-right text-gray-900">₹{cust.totalTax.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Supplier-wise Report */}
        {activeTab === 'supplier' && reportData && reportData.suppliers && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Supplier-wise Report</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Supplier</th>
                    <th className="px-4 py-2 text-right text-gray-700 font-medium">Purchases</th>
                    <th className="px-4 py-2 text-right text-gray-700 font-medium">Total Amount</th>
                    <th className="px-4 py-2 text-right text-gray-700 font-medium">Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.suppliers.map((supp: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-900">{supp.supplierName}</td>
                      <td className="px-4 py-2 text-right text-gray-600">{supp.totalPurchases}</td>
                      <td className="px-4 py-2 text-right text-gray-900">₹{supp.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2 text-right text-gray-900">₹{supp.totalTax.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* GST Reports */}
        {activeTab === 'gst' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">GST Reports</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
            {reportData && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Invoices</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.totalInvoices || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Tax</p>
                  <p className="text-2xl font-bold text-gray-900">₹{(reportData.totalTax || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">📋 Report Information</h3>
          <ul className="text-blue-900 space-y-2 text-sm">
            <li>✓ GSTR-1: Outward supplies (B2B, B2C, CDNR, CDNUR)</li>
            <li>✓ GSTR-2: Inward supplies (B2B, B2C, CDNR, CDNUR)</li>
            <li>✓ GSTR-3B: Monthly GST return</li>
            <li>✓ All reports are auto-calculated based on your invoices</li>
            <li>✓ Download in JSON format for GSTN portal submission</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

