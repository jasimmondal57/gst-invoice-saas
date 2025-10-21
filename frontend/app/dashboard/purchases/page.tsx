'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Purchase {
  id: string;
  purchaseNumber: string;
  purchaseDate: string;
  supplier: {
    id: string;
    name: string;
  };
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit: string;
    rate: number;
    gstRate: number;
  }>;
}

export default function PurchasesPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
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
      fetchPurchases(authToken, orgId || '');
    }
  }, [router]);

  const fetchPurchases = async (authToken: string, orgId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/v1/purchases?organizationId=${orgId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPurchases(data);
      }
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this purchase?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/v1/purchases/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchPurchases(token, organizationId);
      } else {
        alert('Failed to delete purchase');
      }
    } catch (error) {
      console.error('Error deleting purchase:', error);
      alert('Error deleting purchase');
    }
  };

  const filteredPurchases = purchases.filter(p => {
    const matchesSearch = p.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.supplier.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'RECEIVED':
        return 'bg-blue-100 text-blue-800';
      case 'VERIFIED':
        return 'bg-green-100 text-green-800';
      case 'PAID':
        return 'bg-indigo-100 text-indigo-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Purchase Invoices</h1>
          <button
            onClick={() => router.push('/dashboard/purchases/create')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            + Create Purchase
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by purchase number or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="RECEIVED">Received</option>
            <option value="VERIFIED">Verified</option>
            <option value="PAID">Paid</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading purchases...</p>
            </div>
          ) : filteredPurchases.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {purchases.length === 0 ? 'No purchases yet. Create your first purchase!' : 'No purchases match your search.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Purchase #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Supplier</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Items</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{purchase.purchaseNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{purchase.supplier.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(purchase.purchaseDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{purchase.items.length}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ₹{purchase.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(purchase.status)}`}>
                          {purchase.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => router.push(`/dashboard/purchases/${purchase.id}`)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(purchase.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
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
