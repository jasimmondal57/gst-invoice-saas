'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface PurchaseOrderItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  gstRate: number;
  amount: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  poDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  notes: string;
  items: PurchaseOrderItem[];
}

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    notes: '',
  });

  useEffect(() => {
    fetchPurchaseOrder();
  }, [id]);

  const fetchPurchaseOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const organizationId = localStorage.getItem('organizationId');

      const response = await fetch(`http://localhost:5000/api/v1/purchase-orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ organizationId }),
      });

      if (response.ok) {
        const data = await response.json();
        setPo(data);
        setFormData({ notes: data.notes || '' });
        setError('');
      } else {
        setError('Purchase order not found');
      }
    } catch (err) {
      console.error('Error fetching purchase order:', err);
      setError('Failed to load purchase order');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const organizationId = localStorage.getItem('organizationId');

      const response = await fetch(`http://localhost:5000/api/v1/purchase-orders/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
          ...formData,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        fetchPurchaseOrder();
      }
    } catch (err) {
      console.error('Error updating purchase order:', err);
      setError('Failed to update purchase order');
    }
  };

  const handleConfirmPO = async () => {
    try {
      const token = localStorage.getItem('token');
      const organizationId = localStorage.getItem('organizationId');

      const response = await fetch(`http://localhost:5000/api/v1/purchase-orders/${id}/confirm`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organizationId }),
      });

      if (response.ok) {
        fetchPurchaseOrder();
      }
    } catch (err) {
      console.error('Error confirming purchase order:', err);
      setError('Failed to confirm purchase order');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      DRAFT: 'bg-gray-100 text-gray-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      RECEIVED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">Loading...</div>;
  }

  if (!po) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error || 'Purchase order not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Purchase Order</h1>
            <p className="text-gray-600 mt-2">{po.poNumber}</p>
          </div>
          <div className="flex gap-2">
            {po.status === 'DRAFT' && (
              <button
                onClick={handleConfirmPO}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Confirm PO
              </button>
            )}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-8">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(po.status)}`}>
            {po.status}
          </span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Edit Form */}
        {isEditing && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Edit Purchase Order</h2>
            <form onSubmit={handleUpdatePO} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save Changes
              </button>
            </form>
          </div>
        )}

        {/* PO Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Order Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm">PO Number</p>
                <p className="font-medium">{po.poNumber}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">PO Date</p>
                <p className="font-medium">{new Date(po.poDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Due Date</p>
                <p className="font-medium">{new Date(po.dueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Status</p>
                <p className="font-medium">{po.status}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Amount Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <p className="text-gray-600">Subtotal</p>
                <p className="font-medium">₹{po.subtotal.toLocaleString('en-IN')}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Tax</p>
                <p className="font-medium">₹{po.taxAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <p className="font-semibold">Total</p>
                <p className="font-bold text-lg">₹{po.totalAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Description</th>
                  <th className="px-6 py-3 text-left font-semibold">Quantity</th>
                  <th className="px-6 py-3 text-left font-semibold">Unit</th>
                  <th className="px-6 py-3 text-left font-semibold">Rate</th>
                  <th className="px-6 py-3 text-left font-semibold">GST %</th>
                  <th className="px-6 py-3 text-left font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {po.items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3">{item.description}</td>
                    <td className="px-6 py-3">{item.quantity}</td>
                    <td className="px-6 py-3">{item.unit}</td>
                    <td className="px-6 py-3">₹{item.rate.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-3">{item.gstRate}%</td>
                    <td className="px-6 py-3 font-medium">₹{item.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        {po.notes && (
          <div className="bg-white rounded-lg shadow p-6 mt-8">
            <h3 className="text-lg font-semibold mb-4">Notes</h3>
            <p className="text-gray-700">{po.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

