'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

interface FormErrors {
  [key: string]: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState('');
  const [organizationId, setOrganizationId] = useState('');
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
    setOrganizationId(orgId || '');
    fetchCustomers(authToken);
  }, [router]);

  const fetchCustomers = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/customers', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
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

  const validateGSTIN = (gstin: string): boolean => {
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const validatePincode = (pincode: string): boolean => {
    const pincodeRegex = /^[0-9]{6}$/;
    return pincodeRegex.test(pincode);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name) newErrors.name = 'Customer name is required';

    // For B2B customers, GSTIN is required
    if (formData.type === 'B2B') {
      if (!formData.gstin) newErrors.gstin = 'GSTIN is required for B2B customers';
      else if (!validateGSTIN(formData.gstin)) newErrors.gstin = 'Invalid GSTIN format';
    }

    if (formData.email && !validateEmail(formData.email)) newErrors.email = 'Invalid email format';
    if (formData.phone && !validatePhone(formData.phone)) newErrors.phone = 'Invalid phone (10 digits required)';
    if (formData.address && formData.address.length < 5) newErrors.address = 'Address must be at least 5 characters';
    if (formData.state && formData.state.length < 2) newErrors.state = 'State is invalid';
    if (formData.pincode && !validatePincode(formData.pincode)) newErrors.pincode = 'Invalid pincode (6 digits required)';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      const customerData = {
        organizationId,
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        type: formData.type,
        gstin: formData.type === 'B2B' ? formData.gstin : undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        pincode: formData.pincode || undefined,
      };

      const response = await fetch('http://localhost:5000/api/v1/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customerData),
      });

      if (response.ok) {
        setSuccess('Customer added successfully!');
        setFormData({ name: '', email: '', phone: '', type: 'B2B', gstin: '', address: '', city: '', state: '', pincode: '' });
        setShowForm(false);
        setTimeout(() => setSuccess(''), 3000);
        fetchCustomers(token);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert('Failed to add customer: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to create customer:', error);
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
              <p className="text-gray-600 mt-1">Manage your customers</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
            >
              {showForm ? '✕ Cancel' : '+ Add Customer'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Customer Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Customer</h2>

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                <p className="text-green-700 font-medium">✓ {success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Customer Type <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="B2B"
                      checked={formData.type === 'B2B'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'B2B' | 'B2C' })}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="ml-2 text-gray-700">B2B (Business)</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="B2C"
                      checked={formData.type === 'B2C'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'B2B' | 'B2C' })}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="ml-2 text-gray-700">B2C (Consumer)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Customer Name"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-500 text-gray-900 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {formData.type === 'B2B' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GSTIN <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="gstin"
                      value={formData.gstin}
                      onChange={handleInputChange}
                      placeholder="27AABCT1234H1Z0"
                      maxLength="15"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-500 text-gray-900 ${
                        errors.gstin ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.gstin && <p className="text-red-500 text-sm mt-1">{errors.gstin}</p>}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-500 text-gray-900 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    maxLength="10"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-500 text-gray-900 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Building/Flat no., Road/Street, Locality"
                  rows={2}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-500 text-gray-900 ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Maharashtra"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-500 text-gray-900 ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="400001"
                    maxLength="6"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-500 text-gray-900 ${
                      errors.pincode ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                >
                  Add Customer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setErrors({});
                  }}
                  className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Customers List */}
        {customers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No customers yet</h3>
            <p className="text-gray-700 mb-6">Add your first customer to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
            >
              Add First Customer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <div key={customer.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{customer.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    customer.type === 'B2B'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {customer.type}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  {customer.email && (
                    <p>
                      <span className="font-medium">Email:</span> {customer.email}
                    </p>
                  )}
                  {customer.phone && (
                    <p>
                      <span className="font-medium">Phone:</span> {customer.phone}
                    </p>
                  )}
                  {customer.gstin && (
                    <p>
                      <span className="font-medium">GSTIN:</span> {customer.gstin}
                    </p>
                  )}
                  {customer.city && (
                    <p>
                      <span className="font-medium">City:</span> {customer.city}
                    </p>
                  )}
                  {customer.state && (
                    <p>
                      <span className="font-medium">State:</span> {customer.state}
                    </p>
                  )}
                  {customer.address && (
                    <p>
                      <span className="font-medium">Address:</span> {customer.address}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

