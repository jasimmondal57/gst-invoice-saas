'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, Card, CardHeader, StatusBadge } from '@/components/VyapaarComponents';

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  reorderPoint: number;
  lastUpdated: string;
}

export default function InventoryPage() {
  const router = useRouter();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      router.push('/login');
      return;
    }
    setToken(authToken);
    fetchInventory(authToken);
  }, [router]);

  const fetchInventory = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/inventory', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) return 'OUT_OF_STOCK';
    if (item.quantity <= item.reorderPoint) return 'LOW_STOCK';
    return 'IN_STOCK';
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getStockStatus(item);
    const matchesStatus = filterStatus === 'ALL' || status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const lowStockCount = inventory.filter(item => getStockStatus(item) === 'LOW_STOCK').length;
  const outOfStockCount = inventory.filter(item => getStockStatus(item) === 'OUT_OF_STOCK').length;

  return (
    <VyapaarPage
      title="Inventory"
      subtitle="Track stock levels and manage inventory"
      loading={loading}
      filters={
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-lg border text-sm flex-1"
            style={{ borderColor: 'var(--border-gray)' }}
          />
          {['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'].map((status) => (
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
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      }
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Total Products</p>
            <p className="text-2xl font-bold mt-2" style={{ color: 'var(--primary)' }}>{inventory.length}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Low Stock</p>
            <p className="text-2xl font-bold mt-2" style={{ color: 'var(--warning)' }}>{lowStockCount}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Out of Stock</p>
            <p className="text-2xl font-bold mt-2" style={{ color: 'var(--error)' }}>{outOfStockCount}</p>
          </div>
        </Card>
      </div>

      {/* Inventory List */}
      {filteredInventory.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-dark)' }}>No inventory items</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>Add products to track inventory</p>
        </Card>
      ) : (
        <Card>
          <CardHeader title={`Inventory (${filteredInventory.length})`} subtitle="Stock levels and reorder points" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--light-gray)', borderBottom: '1px solid var(--border-gray)' }}>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Product</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Unit</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Reorder Point</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50" style={{ borderColor: 'var(--border-gray)' }}>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-dark)' }}>{item.productName}</td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>{item.quantity}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{item.unit}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{item.reorderPoint}</td>
                    <td className="px-4 py-3 text-sm"><StatusBadge status={getStockStatus(item)} /></td>
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
import Link from 'next/link';

interface InventoryItem {
  id: string;
  product: {
    id: string;
    name: string;
    unit: string;
    price: number;
    lowStockAlert: number;
  };
  quantity: number;
  reorderLevel: number;
  reorderQuantity: number;
  lastRestockDate?: string;
}

export default function InventoryPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
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
      fetchInventory(authToken, orgId || '');
    }
  }, [router]);

  const fetchInventory = async (authToken: string, orgId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/v1/inventory?organizationId=${orgId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity <= 0) return 'OUT_OF_STOCK';
    if (item.quantity <= item.product.lowStockAlert) return 'LOW_STOCK';
    return 'IN_STOCK';
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

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesStatus = true;

    if (filterStatus === 'LOW_STOCK') {
      matchesStatus = item.quantity <= item.product.lowStockAlert && item.quantity > 0;
    } else if (filterStatus === 'OUT_OF_STOCK') {
      matchesStatus = item.quantity <= 0;
    } else if (filterStatus === 'IN_STOCK') {
      matchesStatus = item.quantity > item.product.lowStockAlert;
    }

    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalProducts: inventory.length,
    lowStock: inventory.filter(i => i.quantity <= i.product.lowStockAlert && i.quantity > 0).length,
    outOfStock: inventory.filter(i => i.quantity <= 0).length,
    totalValue: inventory.reduce((sum, i) => sum + (i.quantity * i.product.price), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Inventory Management</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total Products</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Low Stock</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.lowStock}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Out of Stock</p>
            <p className="text-3xl font-bold text-red-600">{stats.outOfStock}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total Value</p>
            <p className="text-3xl font-bold text-indigo-600">₹{stats.totalValue.toFixed(0)}</p>
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

        {/* Inventory List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading inventory...</p>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {inventory.length === 0 ? 'No inventory data yet.' : 'No items match your search.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Unit</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Current Stock</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reorder Level</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Unit Price</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Stock Value</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Last Restock</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => {
                    const status = getStockStatus(item);
                    const stockValue = item.quantity * item.product.price;
                    return (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.product.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.product.unit}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.quantity}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.reorderLevel}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">₹{item.product.price.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{stockValue.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                            {status === 'OUT_OF_STOCK' ? 'Out of Stock' : status === 'LOW_STOCK' ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.lastRestockDate ? new Date(item.lastRestockDate).toLocaleDateString('en-IN') : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

