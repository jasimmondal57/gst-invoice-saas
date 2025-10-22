'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, Card, CardHeader } from '@/components/VyapaarComponents';

export default function ManufacturingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const features = [
    { title: 'Bill of Materials', icon: '📋', description: 'Create and manage BOMs' },
    { title: 'Production Orders', icon: '🏭', description: 'Track production orders' },
    { title: 'Work Orders', icon: '⚙️', description: 'Manage work orders' },
    { title: 'Quality Control', icon: '✓', description: 'Quality assurance tracking' },
    { title: 'Production Reports', icon: '📊', description: 'Production analytics' },
    { title: 'Cost Analysis', icon: '💰', description: 'Manufacturing cost analysis' },
  ];

  return (
    <VyapaarPage
      title="Manufacturing"
      subtitle="Manage manufacturing and production"
      loading={loading}
    >
      <div className="grid grid-cols-2 gap-4">
        {features.map((feature, idx) => (
          <Card key={idx} className="cursor-pointer hover:shadow-lg transition">
            <div className="p-6">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>{feature.title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-gray)' }}>{feature.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </VyapaarPage>
  );
}

interface BOM {
  id: string;
  name: string;
  description?: string;
  product: { name: string };
  items: any[];
}

interface ProductionOrder {
  id: string;
  orderNumber: string;
  quantity: number;
  status: string;
  startDate?: string;
  endDate?: string;
  bom: BOM;
}

export default function ManufacturingPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [boms, setBOMs] = useState<BOM[]>([]);
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bom' | 'orders'>('bom');
  const [showBOMForm, setShowBOMForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [bomForm, setBOMForm] = useState({
    name: '',
    description: '',
    productId: '',
    items: [] as any[]
  });

  const [orderForm, setOrderForm] = useState({
    bomId: '',
    quantity: 0,
    notes: ''
  });

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    const orgId = localStorage.getItem('organizationId');
    if (!authToken) {
      router.push('/login');
    } else {
      setToken(authToken);
      setOrganizationId(orgId || '');
      fetchBOMs(authToken, orgId || '');
      fetchOrders(authToken, orgId || '');
    }
  }, [router]);

  const fetchBOMs = async (authToken: string, orgId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/manufacturing/bom?organizationId=${orgId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBOMs(data);
      }
    } catch (error) {
      console.error('Failed to fetch BOMs:', error);
    }
  };

  const fetchOrders = async (authToken: string, orgId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/manufacturing/production-orders?organizationId=${orgId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBOM = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/v1/manufacturing/bom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          organizationId,
          ...bomForm,
          items: bomForm.items || []
        })
      });

      if (response.ok) {
        setSuccess('BOM created successfully!');
        setBOMForm({ name: '', description: '', productId: '', items: [] });
        setShowBOMForm(false);
        fetchBOMs(token, organizationId);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError('Failed to create BOM');
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/v1/manufacturing/production-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          organizationId,
          ...orderForm
        })
      });

      if (response.ok) {
        setSuccess('Production order created!');
        setOrderForm({ bomId: '', quantity: 0, notes: '' });
        setShowOrderForm(false);
        fetchOrders(token, organizationId);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError('Failed to create production order');
    }
  };

  const handleDeleteBOM = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/v1/manufacturing/bom/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('BOM deleted!');
        fetchBOMs(token, organizationId);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError('Failed to delete BOM');
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/v1/manufacturing/production-orders/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess('Production order deleted!');
        fetchOrders(token, organizationId);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError('Failed to delete production order');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Manufacturing</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6 text-green-700">✓ {success}</div>}
        {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6 text-red-700">✗ {error}</div>}

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('bom')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'bom'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Bill of Materials
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'orders'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Production Orders
          </button>
        </div>

        {/* BOM Tab */}
        {activeTab === 'bom' && (
          <div>
            <button
              onClick={() => setShowBOMForm(!showBOMForm)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium mb-6"
            >
              + Create BOM
            </button>

            {showBOMForm && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Bill of Materials</h2>
                <form onSubmit={handleCreateBOM} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">BOM Name *</label>
                    <input
                      type="text"
                      value={bomForm.name}
                      onChange={(e) => setBOMForm({ ...bomForm, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={bomForm.description}
                      onChange={(e) => setBOMForm({ ...bomForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                    >
                      Create BOM
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBOMForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boms.map((bom) => (
                <div key={bom.id} className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{bom.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">Product: {bom.product.name}</p>
                  <p className="text-sm text-gray-600 mb-4">Items: {bom.items.length}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteBOM(bom.id)}
                      className="flex-1 px-3 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Production Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <button
              onClick={() => setShowOrderForm(!showOrderForm)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium mb-6"
            >
              + Create Production Order
            </button>

            {showOrderForm && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Production Order</h2>
                <form onSubmit={handleCreateOrder} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">BOM *</label>
                    <select
                      value={orderForm.bomId}
                      onChange={(e) => setOrderForm({ ...orderForm, bomId: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    >
                      <option value="">Select BOM</option>
                      {boms.map((bom) => (
                        <option key={bom.id} value={bom.id}>
                          {bom.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                    <input
                      type="number"
                      value={orderForm.quantity}
                      onChange={(e) => setOrderForm({ ...orderForm, quantity: parseFloat(e.target.value) })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                    >
                      Create Order
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowOrderForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Order #</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">BOM</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Quantity</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.bom.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{order.quantity}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="text-red-600 hover:text-red-700 font-medium text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

