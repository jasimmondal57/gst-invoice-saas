'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, SecondaryButton, FormInput, FormSelect, Card, CardHeader, StatusBadge, Alert } from '@/components/VyapaarComponents';

// Indian States List
const INDIAN_STATES = [
  'Andaman & Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra & Nagar Haveli',
  'Daman & Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

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
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
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
    if (!formData.state) newErrors.state = 'State is required';
    if (formData.type === 'B2B' && !formData.gstin) newErrors.gstin = 'GSTIN is required for B2B customers';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const orgId = localStorage.getItem('organizationId') || '';
      const url = editingCustomerId
        ? `http://localhost:5000/api/v1/customers/${editingCustomerId}`
        : 'http://localhost:5000/api/v1/customers';

      const method = editingCustomerId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, organizationId: orgId }),
      });

      if (response.ok) {
        const message = editingCustomerId ? 'Customer updated successfully!' : 'Customer added successfully!';
        setSuccess(message);
        setFormData({ name: '', email: '', phone: '', type: 'B2B', gstin: '', address: '', city: '', state: '', pincode: '' });
        setEditingCustomerId(null);
        setShowForm(false);
        fetchCustomers(token, orgId);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Failed to save customer:', error);
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      type: customer.type,
      gstin: customer.gstin || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      pincode: customer.pincode || '',
    });
    setEditingCustomerId(customer.id);
    setShowForm(true);
    setErrors({});
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/v1/customers/${customerId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSuccess('Customer deleted successfully!');
        const orgId = localStorage.getItem('organizationId') || '';
        fetchCustomers(token, orgId);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Failed to delete customer:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCustomerId(null);
    setFormData({ name: '', email: '', phone: '', type: 'B2B', gstin: '', address: '', city: '', state: '', pincode: '' });
    setShowForm(false);
    setErrors({});
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
      {/* Add/Edit Customer Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader
            title={editingCustomerId ? "Edit Customer" : "Add New Customer"}
            subtitle={editingCustomerId ? "Update customer details" : "Enter customer details"}
          />
          {success && <Alert type="success" message={`✓ ${success}`} />}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>
                  Customer Name <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter customer name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                  style={{
                    borderColor: errors.name ? 'var(--error)' : 'var(--border-gray)',
                    color: 'var(--text-dark)',
                  }}
                />
                {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{errors.name}</p>}
              </div>
              <FormSelect
                label="Customer Type"
                options={[
                  { value: 'B2B', label: 'B2B (Business)' },
                  { value: 'B2C', label: 'B2C (Consumer)' },
                ]}
                value={formData.type}
                onChange={(e: any) => {
                  const newType = e.target.value as 'B2B' | 'B2C';
                  setFormData({ ...formData, type: newType, gstin: newType === 'B2C' ? '' : formData.gstin });
                  // Clear GSTIN error when switching to B2C
                  if (newType === 'B2C' && errors.gstin) {
                    setErrors({ ...errors, gstin: '' });
                  }
                }}
                required
              />
            </div>

            {formData.type === 'B2B' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>
                  GSTIN <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type="text"
                  name="gstin"
                  placeholder="27AABCT1234H1Z0"
                  value={formData.gstin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                  style={{
                    borderColor: errors.gstin ? 'var(--error)' : 'var(--border-gray)',
                    color: 'var(--text-dark)',
                  }}
                />
                {errors.gstin && <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{errors.gstin}</p>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                  style={{
                    borderColor: 'var(--border-gray)',
                    color: 'var(--text-dark)',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                  style={{
                    borderColor: 'var(--border-gray)',
                    color: 'var(--text-dark)',
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>Address</label>
              <textarea
                name="address"
                placeholder="Full address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: 'var(--border-gray)',
                  color: 'var(--text-dark)',
                }}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                  style={{
                    borderColor: 'var(--border-gray)',
                    color: 'var(--text-dark)',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>State *</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: errors.state ? 'var(--error)' : 'var(--border-gray)', color: 'var(--text-dark)', backgroundColor: 'var(--white)' }}
                  required
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {errors.state && <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{errors.state}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  placeholder="Pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                  style={{
                    borderColor: 'var(--border-gray)',
                    color: 'var(--text-dark)',
                  }}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-gray)' }}>
              <PrimaryButton onClick={handleSubmit}>
                {editingCustomerId ? 'Update Customer' : 'Save Customer'}
              </PrimaryButton>
              <SecondaryButton onClick={handleCancelEdit}>Cancel</SecondaryButton>
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
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>State</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Actions</th>
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
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{customer.state || '-'}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="px-3 py-1 rounded text-sm font-medium transition"
                          style={{
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="px-3 py-1 rounded text-sm font-medium transition"
                          style={{
                            backgroundColor: '#F44336',
                            color: 'white',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
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
