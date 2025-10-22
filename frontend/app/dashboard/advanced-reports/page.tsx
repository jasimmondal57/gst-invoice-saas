'use client';

import { useState, useEffect } from 'react';

interface SalesData {
  totalSales: number;
  totalTax: number;
  totalInvoices: number;
  averageInvoiceValue: number;
  customerWiseSales: { [key: string]: number };
}

interface ProfitLossData {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: string;
}

interface TopProduct {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export default function AdvancedReportsPage() {
  const [activeTab, setActiveTab] = useState('sales');
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [plData, setPlData] = useState<ProfitLossData | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const organizationId = localStorage.getItem('organizationId');

      // Fetch Sales Report
      const salesRes = await fetch('http://localhost:5000/api/v1/advanced-reports/sales/summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ organizationId }),
      });

      if (salesRes.ok) {
        setSalesData(await salesRes.json());
      }

      // Fetch P&L Report
      const plRes = await fetch('http://localhost:5000/api/v1/advanced-reports/profit-loss', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ organizationId }),
      });

      if (plRes.ok) {
        setPlData(await plRes.json());
      }

      // Fetch Top Products
      const productsRes = await fetch('http://localhost:5000/api/v1/advanced-reports/inventory/top-products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ organizationId }),
      });

      if (productsRes.ok) {
        setTopProducts(await productsRes.json());
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Advanced Reports</h1>
          <p className="text-gray-600 mt-2">Comprehensive business analytics and insights</p>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={fetchReports}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply Filter
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="flex border-b border-gray-200">
            {['sales', 'pl', 'inventory'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'sales' && 'Sales Report'}
                {tab === 'pl' && 'Profit & Loss'}
                {tab === 'inventory' && 'Top Products'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <>
                {/* Sales Report */}
                {activeTab === 'sales' && salesData && (
                  <div>
                    <h2 className="text-lg font-semibold mb-6">Sales Summary</h2>
                    <div className="grid grid-cols-4 gap-4 mb-8">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-gray-600 text-sm">Total Sales</div>
                        <div className="text-2xl font-bold text-blue-600">
                          ₹{salesData.totalSales.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-gray-600 text-sm">Total Tax</div>
                        <div className="text-2xl font-bold text-green-600">
                          ₹{salesData.totalTax.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-gray-600 text-sm">Total Invoices</div>
                        <div className="text-2xl font-bold text-purple-600">{salesData.totalInvoices}</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="text-gray-600 text-sm">Avg Invoice Value</div>
                        <div className="text-2xl font-bold text-orange-600">
                          ₹{salesData.averageInvoiceValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-4">Customer-wise Sales</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-2 text-left font-semibold">Customer</th>
                            <th className="px-4 py-2 text-left font-semibold">Sales Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(salesData.customerWiseSales).map(([customer, amount]) => (
                            <tr key={customer} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-2">{customer}</td>
                              <td className="px-4 py-2 font-medium">
                                ₹{(amount as number).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* P&L Report */}
                {activeTab === 'pl' && plData && (
                  <div>
                    <h2 className="text-lg font-semibold mb-6">Profit & Loss Statement</h2>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                        <span className="font-medium">Total Revenue</span>
                        <span className="text-2xl font-bold text-blue-600">
                          ₹{plData.totalRevenue.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                        <span className="font-medium">Total Cost</span>
                        <span className="text-2xl font-bold text-red-600">
                          ₹{plData.totalCost.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="border-t-2 border-gray-300 pt-4">
                        <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                          <span className="font-bold text-lg">Gross Profit</span>
                          <span className="text-3xl font-bold text-green-600">
                            ₹{plData.grossProfit.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                        <span className="font-medium">Profit Margin</span>
                        <span className="text-2xl font-bold text-purple-600">{plData.profitMargin}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Top Products */}
                {activeTab === 'inventory' && (
                  <div>
                    <h2 className="text-lg font-semibold mb-6">Top Selling Products</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-2 text-left font-semibold">Product Name</th>
                            <th className="px-4 py-2 text-left font-semibold">Quantity Sold</th>
                            <th className="px-4 py-2 text-left font-semibold">Total Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topProducts.map((product) => (
                            <tr key={product.productId} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-2 font-medium">{product.productName}</td>
                              <td className="px-4 py-2">{product.totalQuantity}</td>
                              <td className="px-4 py-2 font-medium">
                                ₹{product.totalRevenue.toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

