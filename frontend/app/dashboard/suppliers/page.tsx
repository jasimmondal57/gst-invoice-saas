'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, Card, CardHeader } from '@/components/VyapaarComponents';

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gstNumber: string;
  paymentTerms: string;
  totalPurchases: number;
}

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      router.push('/login');
      return;
    }
    setToken(authToken);
    fetchSuppliers(authToken);
  }, [router]);

  const fetchSuppliers = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/suppliers', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPurchases = suppliers.reduce((sum, s) => sum + s.totalPurchases, 0);

  return (
    <VyapaarPage
      title="Suppliers"
      subtitle="Manage vendor relationships and payments"
      loading={loading}
      action={
        <PrimaryButton onClick={() => router.push('/dashboard/suppliers/create')}>
          + Add Supplier
        </PrimaryButton>
      }
      filters={
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-lg border text-sm flex-1"
            style={{ borderColor: 'var(--border-gray)' }}
          />
        </div>
      }
    >
      {/* Summary Card */}
      <Card className="mb-6">
        <div className="grid grid-cols-2 gap-4 p-6">
          <div>
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Total Suppliers</p>
            <p className="text-2xl font-bold mt-2" style={{ color: 'var(--primary)' }}>{suppliers.length}</p>
          </div>
          <div>
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Total Purchases</p>
            <p className="text-2xl font-bold mt-2" style={{ color: 'var(--success)' }}>₹{totalPurchases.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </Card>

      {/* Suppliers List */}
      {filteredSuppliers.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">🏭</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-dark)' }}>No suppliers yet</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>Add suppliers to manage purchases</p>
          <PrimaryButton onClick={() => router.push('/dashboard/suppliers/create')}>Add Supplier</PrimaryButton>
        </Card>
      ) : (
        <Card>
          <CardHeader title={`Suppliers (${filteredSuppliers.length})`} subtitle="Vendor information and purchase history" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--light-gray)', borderBottom: '1px solid var(--border-gray)' }}>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>GST Number</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Total Purchases</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Payment Terms</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-b hover:bg-gray-50 cursor-pointer" style={{ borderColor: 'var(--border-gray)' }} onClick={() => router.push(`/dashboard/suppliers/${supplier.id}`)}>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-dark)' }}>{supplier.name}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-dark)' }}>{supplier.email}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{supplier.phone}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{supplier.gstNumber || '-'}</td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>₹{supplier.totalPurchases.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{supplier.paymentTerms}</td>
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
