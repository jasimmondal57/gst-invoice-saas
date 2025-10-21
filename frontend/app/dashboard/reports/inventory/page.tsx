'use client';

import { useState, useEffect } from 'react';

interface InventorySummary {
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  inStockCount: number;
  stockHealth: {
    excellent: number;
    warning: number;
    critical: number;
  };
}

export default function InventoryReportsPage() {
  const [activeTab, setActiveTab] = useState('summary');
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [valuationReport, setValuationReport] = useState<any[]>([]);
  const [agingReport, setAgingReport] = useState<any[]>([]);
  const [turnoverReport, setTurnoverReport] = useState<any[]>([]);
  const [lowStockReport, setLowStockReport] = useState<any[]>([]);
  const [movementReport, setMovementReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const organizationId = localStorage.getItem('organizationId');

      const response = await fetch('http://localhost:5000/api/v1/reports/inventory/summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ organizationId }),
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async (reportType: string) => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const organizationId = localStorage.getItem('organizationId');

      const response = await fetch(`http://localhost:5000/api/v1/reports/inventory/${reportType}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ organizationId }),
      });

      if (!response.ok) throw new Error('Failed to fetch report');

      const data = await response.json();

      switch (reportType) {
        case 'valuation':
          setValuationReport(data.report);
          break;
        case 'aging':
          setAgingReport(data.report);
          break;
        case 'turnover':
          setTurnoverReport(data.report);
          break;
        case 'low-stock':
          setLowStockReport(data.report);
          break;
        case 'movement':
          setMovementReport(data.report);
          break;
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'summary') {
      fetchReport(tab);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Reports</h1>
          <p className="text-gray-600 mt-2">Comprehensive inventory analysis and insights</p>
        </div>

        {/* Summary Cards */}
        {activeTab === 'summary' && summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm font-medium">Total Items</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{summary.totalItems}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm font-medium">Total Quantity</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{summary.totalQuantity}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm font-medium">Total Value</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                ₹{summary.totalValue.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-600 text-sm font-medium">Low Stock Items</div>
              <div className="text-3xl font-bold text-orange-600 mt-2">{summary.lowStockCount}</div>
            </div>
          </div>
        )}

        {/* Stock Health */}
        {activeTab === 'summary' && summary && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Health</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">{summary.stockHealth.excellent}</div>
                <div className="text-gray-600 text-sm mt-2">Excellent</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600">{summary.stockHealth.warning}</div>
                <div className="text-gray-600 text-sm mt-2">Warning</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600">{summary.stockHealth.critical}</div>
                <div className="text-gray-600 text-sm mt-2">Critical</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="flex border-b border-gray-200">
            {['summary', 'valuation', 'aging', 'turnover', 'low-stock', 'movement'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading report...</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Valuation Report */}
            {activeTab === 'valuation' && valuationReport.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">Product</th>
                      <th className="px-4 py-2 text-left font-semibold">Qty</th>
                      <th className="px-4 py-2 text-left font-semibold">Unit Price</th>
                      <th className="px-4 py-2 text-left font-semibold">Valuation</th>
                      <th className="px-4 py-2 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {valuationReport.map((item, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{item.productName}</td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        <td className="px-4 py-2">₹{item.unitPrice}</td>
                        <td className="px-4 py-2 font-medium">₹{item.valuationAmount.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            item.status === 'LOW_STOCK' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Low Stock Report */}
            {activeTab === 'low-stock' && lowStockReport.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">Product</th>
                      <th className="px-4 py-2 text-left font-semibold">Current</th>
                      <th className="px-4 py-2 text-left font-semibold">Reorder Level</th>
                      <th className="px-4 py-2 text-left font-semibold">Shortage</th>
                      <th className="px-4 py-2 text-left font-semibold">Suggested PO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockReport.map((item, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{item.productName}</td>
                        <td className="px-4 py-2">{item.currentStock}</td>
                        <td className="px-4 py-2">{item.reorderLevel}</td>
                        <td className="px-4 py-2 text-red-600 font-semibold">{item.shortage}</td>
                        <td className="px-4 py-2">₹{item.estimatedCost.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Turnover Report */}
            {activeTab === 'turnover' && turnoverReport.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">Product</th>
                      <th className="px-4 py-2 text-left font-semibold">Sales</th>
                      <th className="px-4 py-2 text-left font-semibold">Turnover Ratio</th>
                      <th className="px-4 py-2 text-left font-semibold">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {turnoverReport.map((item, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{item.productName}</td>
                        <td className="px-4 py-2">{item.sales}</td>
                        <td className="px-4 py-2 font-semibold">{item.turnoverRatio}x</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            item.turnoverCategory === 'Very High' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {item.turnoverCategory}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && activeTab !== 'summary' && (
              <div className="text-center py-8 text-gray-600">
                Click on a tab to view the report
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

