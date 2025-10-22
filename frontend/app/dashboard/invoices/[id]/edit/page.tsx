'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

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
}

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [token, setToken] = useState('');
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      router.push('/login');
      return;
    }
    setToken(authToken);
    fetchInvoice(authToken, invoiceId);
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
          invoiceNumber: data.invoiceNumber,
          invoiceDate: data.invoiceDate.split('T')[0],
          items: data.items,
          status: data.status,
        });
      }
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData((prev: any) => ({ ...prev, items: newItems }));
  };

  const handleStatusChange = (newStatus: string) => {
    setFormData((prev: any) => ({ ...prev, status: newStatus }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`http://localhost:5000/api/v1/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          invoiceDate: formData.invoiceDate,
          status: formData.status,
          items: formData.items,
        }),
      });

      if (response.ok) {
        alert('Invoice updated successfully!');
        router.push(`/dashboard/invoices/${invoiceId}`);
      } else {
        const error = await response.json();
        alert('Failed to update invoice: ' + (error.error || 'Unknown error'));
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice || !formData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">Invoice not found</p>
            <Link href="/dashboard/invoices">
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Back to Invoices
              </button>
            </Link>
          </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Edit Invoice</h1>
              <p className="text-gray-600 mt-1">{invoice.invoiceNumber}</p>
            </div>
            <Link href={`/dashboard/invoices/${invoiceId}`}>
              <button className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold">
                Cancel
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Status</h2>
            <select
              value={formData.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
            >
              <option value="DRAFT">Unpaid</option>
              <option value="SENT">Sent</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Description</th>
                    <th className="px-4 py-2 text-right text-gray-700 font-medium">Qty</th>
                    <th className="px-4 py-2 text-center text-gray-700 font-medium">Unit</th>
                    <th className="px-4 py-2 text-right text-gray-700 font-medium">Rate</th>
                    <th className="px-4 py-2 text-right text-gray-700 font-medium">Amount</th>
                    <th className="px-4 py-2 text-right text-gray-700 font-medium">GST %</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item: InvoiceItem, index: number) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 text-right"
                        />
                      </td>
                      <td className="px-4 py-2 text-center">{item.unit}</td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 text-right"
                        />
                      </td>
                      <td className="px-4 py-2 text-right">₹{item.amount.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right">{item.gstRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href={`/dashboard/invoices/${invoiceId}`}>
              <button type="button" className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold">
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

