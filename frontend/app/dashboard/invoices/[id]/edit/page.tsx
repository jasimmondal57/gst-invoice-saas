'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

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

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  gstRate: number;
  amount: number;
  gstAmount: number;
  discount: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  hsnCode: string;
  productId?: string;
}

interface Customer {
  id: string;
  name: string;
  type: 'B2B' | 'B2C';
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  email?: string;
  phone?: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  hsn?: string;
  sac?: string;
  unit: string;
  price: number;
  gstRate: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceType: 'B2B' | 'B2C';
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  customer: Customer;
  items: InvoiceItem[];
  dueDate?: string;
  notes?: string;
}

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [token, setToken] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<any>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState<{ [key: number]: boolean }>({});
  const [productSearchTerm, setProductSearchTerm] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    const orgId = localStorage.getItem('organizationId');
    if (!authToken) {
      router.push('/login');
      return;
    }
    setToken(authToken);
    setOrganizationId(orgId || '');
    fetchInvoice(authToken, invoiceId);
    fetchCustomers(authToken, orgId || '');
    fetchProducts(authToken, orgId || '');
  }, [router, invoiceId]);

  const fetchInvoice = async (authToken: string, id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/invoices/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setInvoice(data);
        setFormData({
          customerId: data.customer.id,
          invoiceDate: data.invoiceDate.split('T')[0],
          dueDate: data.dueDate ? data.dueDate.split('T')[0] : '',
          items: data.items || [],
          status: data.status,
          notes: data.notes || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const fetchProducts = async (authToken: string, orgId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/products?organizationId=${orgId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleCustomerChange = (customerId: string) => {
    setFormData((prev: any) => ({ ...prev, customerId }));
    setShowCustomerDropdown(false);
    setCustomerSearchTerm('');
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate amount if quantity or rate changed
    if (field === 'quantity' || field === 'rate') {
      const qty = field === 'quantity' ? parseFloat(value) : newItems[index].quantity;
      const rate = field === 'rate' ? parseFloat(value) : newItems[index].rate;
      newItems[index].amount = qty * rate;
    }

    setFormData((prev: any) => ({ ...prev, items: newItems }));
  };

  const handleAddItem = (product: Product) => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      productId: product.id,
      description: product.name,
      quantity: 1,
      unit: product.unit,
      rate: product.price,
      gstRate: product.gstRate,
      amount: product.price,
      gstAmount: (product.price * product.gstRate) / 100,
      discount: 0,
      discountType: 'PERCENTAGE',
      hsnCode: product.hsn || '',
    };
    setFormData((prev: any) => ({ ...prev, items: [...prev.items, newItem] }));
    setShowProductDropdown({});
    setProductSearchTerm({});
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      items: prev.items.filter((_: any, i: number) => i !== index),
    }));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let taxAmount = 0;

    formData.items.forEach((item: InvoiceItem) => {
      subtotal += item.amount;
      taxAmount += (item.amount * item.gstRate) / 100;
    });

    return { subtotal, taxAmount, totalAmount: subtotal + taxAmount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId) {
      alert('Please select a customer');
      return;
    }

    if (formData.items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    setSaving(true);
    const { subtotal, taxAmount, totalAmount } = calculateTotals();

    const updatePayload = {
      customerId: formData.customerId,
      invoiceDate: formData.invoiceDate,
      dueDate: formData.dueDate || null,
      status: formData.status,
      items: formData.items,
      subtotal,
      taxAmount,
      totalAmount,
      notes: formData.notes,
    };

    console.log('📤 Sending update payload:', updatePayload);

    try {
      const response = await fetch(`http://localhost:5000/api/v1/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      console.log('📥 Response status:', response.status);
      const responseData = await response.json();
      console.log('📥 Response data:', responseData);

      if (response.ok) {
        alert('Invoice updated successfully!');
        router.push(`/dashboard/invoices/${invoiceId}`);
      } else {
        alert('Failed to update invoice: ' + (responseData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      alert('Failed to update invoice');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--light-gray)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--primary)' }}></div>
          <p style={{ color: 'var(--text-gray)' }}>Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice || !formData) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--light-gray)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p style={{ color: 'var(--text-gray)' }} className="mb-4">Invoice not found</p>
            <Link href="/dashboard/invoices">
              <button className="px-6 py-2 text-white rounded-lg font-semibold" style={{ backgroundColor: 'var(--primary)' }}>
                Back to Invoices
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedCustomer = customers.find(c => c.id === formData.customerId);
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );
  const { subtotal, taxAmount, totalAmount } = calculateTotals();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--light-gray)' }}>
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-dark)' }}>Edit Invoice</h1>
              <p style={{ color: 'var(--text-gray)' }} className="mt-1">{invoice.invoiceNumber}</p>
            </div>
            <Link href={`/dashboard/invoices/${invoiceId}`}>
              <button className="px-6 py-2 text-white rounded-lg font-semibold" style={{ backgroundColor: 'var(--text-gray)' }}>
                Cancel
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>Customer</h2>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                className="w-full px-4 py-2 border rounded-lg text-left flex justify-between items-center"
                style={{ borderColor: 'var(--border-gray)', color: 'var(--text-dark)' }}
              >
                {selectedCustomer ? selectedCustomer.name : 'Select Customer'}
                <span>▼</span>
              </button>
              {showCustomerDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10" style={{ borderColor: 'var(--border-gray)' }}>
                  <input
                    type="text"
                    placeholder="Search customer..."
                    value={customerSearchTerm}
                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border-b"
                    style={{ borderColor: 'var(--border-gray)', color: 'var(--text-dark)' }}
                  />
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCustomers.map(customer => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => handleCustomerChange(customer.id)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100"
                        style={{ color: 'var(--text-dark)' }}
                      >
                        {customer.name} {customer.type === 'B2B' ? `(${customer.gstin})` : '(B2C)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>Invoice Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>Invoice Date</label>
                <input
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, invoiceDate: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{ borderColor: 'var(--border-gray)', color: 'var(--text-dark)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{ borderColor: 'var(--border-gray)', color: 'var(--text-dark)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{ borderColor: 'var(--border-gray)', color: 'var(--text-dark)' }}
                >
                  <option value="DRAFT">Unpaid</option>
                  <option value="SENT">Sent</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-dark)' }}>Items</h2>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProductDropdown({ 0: !showProductDropdown[0] })}
                  className="px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  + Add Item
                </button>
                {showProductDropdown[0] && (
                  <div className="absolute top-full right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 w-64" style={{ borderColor: 'var(--border-gray)' }}>
                    <input
                      type="text"
                      placeholder="Search product..."
                      value={productSearchTerm[0] || ''}
                      onChange={(e) => setProductSearchTerm({ ...productSearchTerm, 0: e.target.value })}
                      className="w-full px-4 py-2 border-b"
                      style={{ borderColor: 'var(--border-gray)', color: 'var(--text-dark)' }}
                    />
                    <div className="max-h-48 overflow-y-auto">
                      {products
                        .filter(p => p.name.toLowerCase().includes((productSearchTerm[0] || '').toLowerCase()))
                        .map(product => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => handleAddItem(product)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100"
                            style={{ color: 'var(--text-dark)' }}
                          >
                            {product.name} - ₹{product.price}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ backgroundColor: 'var(--light-gray)', borderBottom: '1px solid var(--border-gray)' }}>
                  <tr>
                    <th className="px-4 py-2 text-left font-medium" style={{ color: 'var(--text-dark)' }}>Description</th>
                    <th className="px-4 py-2 text-right font-medium" style={{ color: 'var(--text-dark)' }}>Qty</th>
                    <th className="px-4 py-2 text-center font-medium" style={{ color: 'var(--text-dark)' }}>Unit</th>
                    <th className="px-4 py-2 text-right font-medium" style={{ color: 'var(--text-dark)' }}>Rate</th>
                    <th className="px-4 py-2 text-right font-medium" style={{ color: 'var(--text-dark)' }}>Amount</th>
                    <th className="px-4 py-2 text-right font-medium" style={{ color: 'var(--text-dark)' }}>GST %</th>
                    <th className="px-4 py-2 text-center font-medium" style={{ color: 'var(--text-dark)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item: InvoiceItem, index: number) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-gray)' }}>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                          style={{ borderColor: 'var(--border-gray)', color: 'var(--text-dark)' }}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                          className="w-full px-2 py-1 border rounded text-right"
                          style={{ borderColor: 'var(--border-gray)', color: 'var(--text-dark)' }}
                        />
                      </td>
                      <td className="px-4 py-2 text-center" style={{ color: 'var(--text-dark)' }}>{item.unit}</td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value))}
                          className="w-full px-2 py-1 border rounded text-right"
                          style={{ borderColor: 'var(--border-gray)', color: 'var(--text-dark)' }}
                        />
                      </td>
                      <td className="px-4 py-2 text-right" style={{ color: 'var(--text-dark)' }}>₹{item.amount.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right" style={{ color: 'var(--text-dark)' }}>{item.gstRate}%</td>
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-end max-w-md ml-auto space-y-2">
              <div className="flex justify-between w-full">
                <span style={{ color: 'var(--text-dark)' }}>Subtotal:</span>
                <span style={{ color: 'var(--text-dark)' }} className="font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-full">
                <span style={{ color: 'var(--text-dark)' }}>GST:</span>
                <span style={{ color: 'var(--text-dark)' }} className="font-semibold">₹{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-full pt-2 border-t" style={{ borderColor: 'var(--border-gray)' }}>
                <span style={{ color: 'var(--text-dark)' }} className="font-bold">Total:</span>
                <span style={{ color: 'var(--primary)' }} className="font-bold text-lg">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg"
              style={{ borderColor: 'var(--border-gray)', color: 'var(--text-dark)' }}
              rows={3}
              placeholder="Add any notes for this invoice..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <Link href={`/dashboard/invoices/${invoiceId}`}>
              <button
                type="button"
                className="px-6 py-3 border-2 rounded-lg font-semibold transition-all duration-200 hover:shadow-md"
                style={{
                  borderColor: 'var(--border-gray)',
                  color: 'var(--text-dark)',
                  backgroundColor: 'var(--white)',
                }}
              >
                ✕ Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg transform hover:scale-105 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--primary)',
              }}
            >
              {saving ? '⏳ Saving...' : '✓ Update Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

