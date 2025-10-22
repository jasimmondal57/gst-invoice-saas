'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, Card, CardHeader, StatusBadge } from '@/components/VyapaarComponents';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  amount: number;
  status: string;
  date: string;
  dueDate: string;
}

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      router.push('/login');
      return;
    }
    setToken(authToken);
    fetchPurchaseOrders(authToken);
  }, [router]);

  const fetchPurchaseOrders = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/purchase-orders', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => filterStatus === 'ALL' || o.status === filterStatus);
  const totalAmount = filteredOrders.reduce((sum, o) => sum + o.amount, 0);

  return (
    <VyapaarPage
      title="Purchase Orders"
      subtitle="Create and manage purchase orders"
      loading={loading}
      action={
        <PrimaryButton onClick={() => router.push('/dashboard/purchase-orders/create')}>
          + Create PO
        </PrimaryButton>
      }
      filters={
        <div className="flex gap-2">
          {['ALL', 'DRAFT', 'SENT', 'CONFIRMED', 'RECEIVED', 'CANCELLED'].map((status) => (
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
              {status}
            </button>
          ))}
        </div>
      }
    >
      {/* Summary Card */}
      <Card className="mb-6">
        <div className="p-6">
          <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Total PO Amount</p>
          <p className="text-3xl font-bold mt-2" style={{ color: 'var(--primary)' }}>₹{totalAmount.toLocaleString('en-IN')}</p>
        </div>
      </Card>

      {/* Purchase Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-dark)' }}>No purchase orders</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>Create purchase orders for suppliers</p>
          <PrimaryButton onClick={() => router.push('/dashboard/purchase-orders/create')}>Create PO</PrimaryButton>
        </Card>
      ) : (
        <Card>
          <CardHeader title={`Purchase Orders (${filteredOrders.length})`} subtitle="All purchase orders" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--light-gray)', borderBottom: '1px solid var(--border-gray)' }}>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>PO #</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Supplier</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Due Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50 cursor-pointer" style={{ borderColor: 'var(--border-gray)' }} onClick={() => router.push(`/dashboard/purchase-orders/${order.id}`)}>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-dark)' }}>{order.poNumber}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-dark)' }}>{order.supplier}</td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>₹{order.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{new Date(order.date).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{new Date(order.dueDate).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm"><StatusBadge status={order.status} /></td>
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
