'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface StockReport {
  productName: string;
  unit: string;
  currentStock: number;
  reorderLevel: number;
  unitPrice: number;
  stockValue: number;
  status: string;
}

export default function StockReportsPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [reports, setReports] = useState<StockReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    const orgId = localStorage.getItem('organizationId');
    if (!authToken) {
      router.push('/login');
    } else {
      setToken(authToken);
      setOrganizationId(orgId || '');
      fetchStockReports(authToken, orgId || '');
    }
  }, [router]);

  const fetchStockReports = async (authToken: string, orgId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/inventory?organizationId=${orgId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (response.ok) {
        const data = await response.json();
        const formattedData = data.map((item: any) => ({
          productName: item.product.name,
          unit: item.product.unit,
          currentStock: item.quantity,
          reorderLevel: item.reorderLevel,
          unitPrice: item.product.price,
          stockValue: item.quantity * item.product.price,
          status: item.quantity <= 0 ? 'OUT_OF_STOCK' : item.quantity <= item.product.lowStockAlert ? 'LOW_STOCK' : 'IN_STOCK',
        }));
        setReports(formattedData);
      }
    } catch (error) {
      console.error('Failed to fetch stock reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.productName.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesStatus = true;

    if (filterStatus === 'LOW_STOCK') {
      matchesStatus = r.status === 'LOW_STOCK';
    } else if (filterStatus === 'OUT_OF_STOCK') {
      matchesStatus = r.status === 'OUT_OF_STOCK';
    } else if (filterStatus === 'IN_STOCK') {
      matchesStatus = r.status === 'IN_STOCK';
    }

    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalProducts: reports.length,
    totalValue: reports.reduce((sum, r) => sum + r.stockValue, 0),
    lowStockCount: reports.filter(r => r.status === 'LOW_STOCK').length,
    outOfStockCount: reports.filter(r => r.status === 'OUT_OF_STOCK').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OUT_OF_STOCK':
        return 'bg-red-100 text-red-800';
      case 'LOW_STOCK':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_STOCK':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Stock Reports</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total Products</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total Stock Value</p>
            <p className="text-3xl font-bold text-indigo-600">₹{stats.totalValue.toFixed(0)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Low Stock Items</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.lowStockCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Out of Stock</p>
            <p className="text-3xl font-bold text-red-600">{stats.outOfStockCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="ALL">All Stock</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
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
              No stock data available.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Unit</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Current Stock</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Reorder Level</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Unit Price</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Stock Value</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{report.productName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{report.unit}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">{report.currentStock}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600">{report.reorderLevel}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600">₹{report.unitPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">₹{report.stockValue.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(report.status)}`}>
                          {report.status === 'OUT_OF_STOCK' ? 'Out of Stock' : report.status === 'LOW_STOCK' ? 'Low Stock' : 'In Stock'}
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

