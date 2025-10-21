'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PurchaseReport {
  purchaseNumber: string;
  supplierName: string;
  purchaseDate: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
}

export default function PurchaseReportsPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [reports, setReports] = useState<PurchaseReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    const orgId = localStorage.getItem('organizationId');
    if (!authToken) {
      router.push('/login');
    } else {
      setToken(authToken);
      setOrganizationId(orgId || '');
      // Set default date range (last 30 days)
      const end = new Date();
      const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
      fetchPurchaseReports(authToken, orgId || '', start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
    }
  }, [router]);

  const fetchPurchaseReports = async (authToken: string, orgId: string, start: string, end: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/purchases?organizationId=${orgId}&startDate=${start}&endDate=${end}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Failed to fetch purchase reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = () => {
    if (startDate && endDate) {
      fetchPurchaseReports(token, organizationId, startDate, endDate);
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    return matchesStatus;
  });

  const stats = {
    totalPurchases: filteredReports.length,
    totalAmount: filteredReports.reduce((sum, r) => sum + r.totalAmount, 0),
    totalTax: filteredReports.reduce((sum, r) => sum + r.taxAmount, 0),
    averageAmount: filteredReports.length > 0 ? filteredReports.reduce((sum, r) => sum + r.totalAmount, 0) / filteredReports.length : 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Purchase Reports</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total Purchases</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalPurchases}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total Amount</p>
            <p className="text-3xl font-bold text-indigo-600">₹{stats.totalAmount.toFixed(0)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total Tax</p>
            <p className="text-3xl font-bold text-green-600">₹{stats.totalTax.toFixed(0)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Average Amount</p>
            <p className="text-3xl font-bold text-blue-600">₹{stats.averageAmount.toFixed(0)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="RECEIVED">Received</option>
                <option value="VERIFIED">Verified</option>
                <option value="PAID">Paid</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleDateFilter}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No purchase data for the selected period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Purchase #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Supplier</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Tax</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Total</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{report.purchaseNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{report.supplierName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(report.purchaseDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-900">₹{report.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-900">₹{report.taxAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">₹{report.totalAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          report.status === 'PAID' ? 'bg-green-100 text-green-800' :
                          report.status === 'VERIFIED' ? 'bg-blue-100 text-blue-800' :
                          report.status === 'RECEIVED' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

