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
