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

interface Organization {
  id: string;
  name: string;
  gstin?: string;
  address?: string;
  state?: string;
  pincode?: string;
}

export default function ViewInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [organizationId, setOrganizationId] = useState('');

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
    fetchOrganization(authToken, orgId || '');
  }, [router, invoiceId]);

  const fetchInvoice = async (authToken: string, id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/invoices/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setInvoice(data);
      }
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganization = async (authToken: string, orgId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/organizations/${orgId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setOrganization(data);
      }
    } catch (error) {
      console.error('Failed to fetch organization:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
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

  if (!invoice) {
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
              <h1 className="text-3xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
              <p className="text-gray-600 mt-1">Invoice Details</p>
            </div>
            <div className="flex gap-3">
              <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                  Edit
                </button>
              </Link>
              <Link href="/dashboard/invoices">
                <button className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold">
                  Back
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-sm">Invoice Date</p>
            <p className="text-2xl font-bold text-gray-900">{new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-sm">Status</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(invoice.status)}`}>
              {invoice.status}
            </span>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-sm">Total Amount</p>
            <p className="text-2xl font-bold text-indigo-600">₹{invoice.totalAmount.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* From */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">From</h3>
            <div className="space-y-2">
              <p className="font-medium text-gray-900">{organization?.name}</p>
              {organization?.gstin && <p className="text-sm text-gray-600">GSTIN: {organization.gstin}</p>}
              {organization?.address && <p className="text-sm text-gray-600">{organization.address}</p>}
              {organization?.state && <p className="text-sm text-gray-600">{organization.state} {organization?.pincode}</p>}
            </div>
          </div>

          {/* To */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">To</h3>
            <div className="space-y-2">
              <p className="font-medium text-gray-900">{invoice.customer.name}</p>
              {invoice.customer.gstin && <p className="text-sm text-gray-600">GSTIN: {invoice.customer.gstin}</p>}
              {invoice.customer.address && <p className="text-sm text-gray-600">{invoice.customer.address}</p>}
              {invoice.customer.city && <p className="text-sm text-gray-600">{invoice.customer.city}, {invoice.customer.state} {invoice.customer.pincode}</p>}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
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
                  <th className="px-4 py-2 text-right text-gray-700 font-medium">GST</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="px-4 py-2">{item.description}</td>
                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                    <td className="px-4 py-2 text-center">{item.unit}</td>
                    <td className="px-4 py-2 text-right">₹{item.rate.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">₹{item.amount.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">{item.gstRate}%</td>
                    <td className="px-4 py-2 text-right">₹{((item.amount * item.gstRate) / 100).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-end">
            <div className="w-80">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-medium">₹{invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4 pb-4 border-b border-gray-200">
                <span className="text-gray-700">Total GST:</span>
                <span className="font-medium">₹{invoice.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="font-bold text-indigo-600">₹{invoice.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

