'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, Card, CardHeader, StatusBadge } from '@/components/VyapaarComponents';

interface Purchase {
  id: string;
  purchaseNumber: string;
  purchaseDate: string;
  supplier: { id: string; name: string };
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
}

export default function PurchasesPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
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
    fetchPurchases(authToken);
  }, [router]);

  const fetchPurchases = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/purchases', {
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

  const filteredPurchases = purchases.filter(p => {
    const matchesSearch = p.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.supplier.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0);

  return (
    <VyapaarPage
      title="Purchases"
      subtitle="Manage purchase orders and vendor payments"
      loading={loading}
      action={
        <PrimaryButton onClick={() => router.push('/dashboard/purchases/create')}>
          + Create Purchase
        </PrimaryButton>
      }
      filters={
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by PO number or vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-lg border text-sm flex-1"
            style={{ borderColor: 'var(--border-gray)' }}
          />
          {['ALL', 'DRAFT', 'CONFIRMED', 'RECEIVED', 'CANCELLED'].map((status) => (
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
          <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Total Purchase Amount</p>
          <p className="text-3xl font-bold mt-2" style={{ color: 'var(--primary)' }}>₹{totalAmount.toLocaleString('en-IN')}</p>
        </div>
      </Card>

      {/* Purchases List */}
      {filteredPurchases.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-dark)' }}>No purchases yet</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>Create your first purchase order to get started</p>
          <PrimaryButton onClick={() => router.push('/dashboard/purchases/create')}>Create Purchase</PrimaryButton>
        </Card>
      ) : (
        <Card>
          <CardHeader title={`Purchases (${filteredPurchases.length})`} subtitle="All purchase orders" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--light-gray)', borderBottom: '1px solid var(--border-gray)' }}>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>PO Number</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Vendor</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b hover:bg-gray-50 cursor-pointer" style={{ borderColor: 'var(--border-gray)' }} onClick={() => router.push(`/dashboard/purchases/${purchase.id}`)}>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-dark)' }}>{purchase.purchaseNumber}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-dark)' }}>{purchase.supplier.name}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{new Date(purchase.purchaseDate).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>₹{purchase.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm"><StatusBadge status={purchase.status} /></td>
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
