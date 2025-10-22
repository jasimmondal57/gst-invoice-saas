'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, SecondaryButton, FormInput, FormSelect, Card, CardHeader, StatusBadge, Alert } from '@/components/VyapaarComponents';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: 'B2B' | 'B2C';
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'B2B' as 'B2B' | 'B2C',
    gstin: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    const orgId = localStorage.getItem('organizationId');
    if (!authToken) {
      router.push('/login');
      return;
    }
    setToken(authToken);
    fetchCustomers(authToken, orgId || '');
  }, [router]);

  const fetchCustomers = async (authToken: string, orgId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/customers?organizationId=${orgId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = 'Customer name is required';
    if (formData.type === 'B2B' && !formData.gstin) newErrors.gstin = 'GSTIN is required for B2B customers';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const orgId = localStorage.getItem('organizationId') || '';
      const response = await fetch('http://localhost:5000/api/v1/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, organizationId: orgId }),
      });

      if (response.ok) {
        setSuccess('Customer added successfully!');
        setFormData({ name: '', email: '', phone: '', type: 'B2B', gstin: '', address: '', city: '', state: '', pincode: '' });
        setShowForm(false);
        fetchCustomers(token, orgId);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Failed to add customer:', error);
    }
  };

  const filteredCustomers = filterType === 'ALL' ? customers : customers.filter(c => c.type === filterType);

  return (
    <VyapaarPage
      title="Customers"
      subtitle="Manage your customers and suppliers"
      loading={loading}
      action={
        <PrimaryButton onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Customer'}
        </PrimaryButton>
      }
      filters={
        <div className="flex gap-2">
          {['ALL', 'B2B', 'B2C'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition"
              style={{
                backgroundColor: filterType === type ? 'var(--primary)' : 'var(--white)',
                color: filterType === type ? 'white' : 'var(--text-gray)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: filterType === type ? 'var(--primary)' : 'var(--border-gray)',
              }}
            >
              {type}
            </button>
          ))}
        </div>
      }
    >
      {/* Add Customer Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader title="Add New Customer" subtitle="Enter customer details" />
          {success && <Alert type="success" message={`✓ ${success}`} />}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Customer Name"
                placeholder="Enter customer name"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                required
              />
              <FormSelect
                label="Customer Type"
                options={[
                  { value: 'B2B', label: 'B2B (Business)' },
                  { value: 'B2C', label: 'B2C (Consumer)' },
                ]}
                value={formData.type}
                onChange={(e: any) => setFormData({ ...formData, type: e.target.value })}
                required
              />
            </div>

            {formData.type === 'B2B' && (
              <FormInput
                label="GSTIN"
                placeholder="27AABCT1234H1Z0"
                value={formData.gstin}
                onChange={handleInputChange}
                error={errors.gstin}
                required
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Email" placeholder="email@example.com" type="email" value={formData.email} onChange={handleInputChange} />
              <FormInput label="Phone" placeholder="+91 9876543210" value={formData.phone} onChange={handleInputChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput label="City" placeholder="City" value={formData.city} onChange={handleInputChange} />
              <FormInput label="State" placeholder="State" value={formData.state} onChange={handleInputChange} />
            </div>

            <FormInput label="Address" placeholder="Full address" value={formData.address} onChange={handleInputChange} />

            <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-gray)' }}>
              <PrimaryButton onClick={handleSubmit}>Save Customer</PrimaryButton>
              <SecondaryButton onClick={() => setShowForm(false)}>Cancel</SecondaryButton>
            </div>
          </form>
        </Card>
      )}

      {/* Customers List */}
      {filteredCustomers.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-dark)' }}>No customers yet</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>Add your first customer to get started</p>
          <PrimaryButton onClick={() => setShowForm(true)}>Add Customer</PrimaryButton>
        </Card>
      ) : (
        <Card>
          <CardHeader title={`Customers (${filteredCustomers.length})`} subtitle="All your customers" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--light-gray)', borderBottom: '1px solid var(--border-gray)' }}>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>City</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50" style={{ borderColor: 'var(--border-gray)' }}>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-dark)' }}>{customer.name}</td>
                    <td className="px-4 py-3 text-sm"><StatusBadge status={customer.type} /></td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{customer.email || '-'}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{customer.phone || '-'}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{customer.city || '-'}</td>
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
