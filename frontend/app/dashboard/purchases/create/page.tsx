'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Supplier {
  id: string;
  name: string;
  type: 'B2B' | 'B2C';
  gstin?: string;
}

interface PurchaseItem {
  description: string;
  quantity: string;
  unit: string;
  rate: string;
  gstRate: string;
}

export default function CreatePurchasePage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    supplierId: '',
    purchaseNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [items, setItems] = useState<PurchaseItem[]>([
    { description: '', quantity: '', unit: 'Nos', rate: '', gstRate: '18' },
  ]);

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    const orgId = localStorage.getItem('organizationId');
    if (!authToken) {
      router.push('/login');
    } else {
      setToken(authToken);
      setOrganizationId(orgId || '');
      fetchSuppliers(authToken, orgId || '');
      generatePurchaseNumber(orgId || '');
    }
  }, [router]);

  const fetchSuppliers = async (authToken: string, orgId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/suppliers?organizationId=${orgId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    }
  };

  const generatePurchaseNumber = async (orgId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/purchases/generate-number/${orgId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, purchaseNumber: data.purchaseNumber }));
      }
    } catch (error) {
      console.error('Failed to generate purchase number:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: '', unit: 'Nos', rate: '', gstRate: '18' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.supplierId) newErrors.supplierId = 'Supplier is required';
    if (!formData.purchaseNumber) newErrors.purchaseNumber = 'Purchase number is required';
    if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required';
    if (items.length === 0) newErrors.items = 'At least one item is required';

    items.forEach((item, index) => {
      if (!item.description) newErrors[`item_${index}_description`] = 'Description is required';
      if (!item.quantity || isNaN(parseFloat(item.quantity))) newErrors[`item_${index}_quantity`] = 'Valid quantity is required';
      if (!item.rate || isNaN(parseFloat(item.rate))) newErrors[`item_${index}_rate`] = 'Valid rate is required';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const purchaseData = {
        organizationId,
        supplierId: formData.supplierId,
        purchaseNumber: formData.purchaseNumber,
        purchaseDate: formData.purchaseDate,
        purchaseType: 'INVOICE',
        notes: formData.notes,
        items: items.map(item => ({
          description: item.description,
          quantity: parseFloat(item.quantity),
          unit: item.unit,
          rate: parseFloat(item.rate),
          gstRate: parseFloat(item.gstRate),
        })),
      };

      const response = await fetch('http://localhost:5000/api/v1/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(purchaseData),
      });

      if (response.ok) {
        setSuccess('Purchase created successfully!');
        setTimeout(() => router.push('/dashboard/purchases'), 2000);
      } else {
        const errorData = await response.json();
        alert('Failed to create purchase: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating purchase:', error);
      alert('Error creating purchase: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let taxAmount = 0;

    items.forEach(item => {
      const itemAmount = parseFloat(item.quantity || '0') * parseFloat(item.rate || '0');
      const itemTax = itemAmount * (parseFloat(item.gstRate || '0') / 100);
      subtotal += itemAmount;
      taxAmount += itemTax;
    });

    return { subtotal, taxAmount, total: subtotal + taxAmount };
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Purchase Invoice</h1>

        {success && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {/* Header Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier <span className="text-red-500">*</span>
              </label>
              <select
                name="supplierId"
                value={formData.supplierId}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${
                  errors.supplierId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
              {errors.supplierId && <p className="text-red-500 text-sm mt-1">{errors.supplierId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="purchaseNumber"
                value={formData.purchaseNumber}
                onChange={handleInputChange}
                placeholder="Auto-generated"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${
                  errors.purchaseNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.purchaseNumber && <p className="text-red-500 text-sm mt-1">{errors.purchaseNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${
                  errors.purchaseDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.purchaseDate && <p className="text-red-500 text-sm mt-1">{errors.purchaseDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes"
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Purchase Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Description</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Qty</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Unit</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Rate</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">GST %</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const itemAmount = parseFloat(item.quantity || '0') * parseFloat(item.rate || '0');
                    const itemTax = itemAmount * (parseFloat(item.gstRate || '0') / 100);
                    return (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            placeholder="Item description"
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                          {errors[`item_${index}_description`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_description`]}</p>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            placeholder="0"
                            step="0.01"
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={item.unit}
                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          >
                            <option value="Nos">Nos</option>
                            <option value="Kg">Kg</option>
                            <option value="Ltr">Ltr</option>
                            <option value="Mtr">Mtr</option>
                            <option value="Box">Box</option>
                            <option value="Pcs">Pcs</option>
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.gstRate}
                            onChange={(e) => handleItemChange(index, 'gstRate', e.target.value)}
                            placeholder="18"
                            step="0.01"
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-2 text-sm font-semibold">
                          ₹{(itemAmount + itemTax).toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300"
            >
              + Add Item
            </button>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 p-4 rounded-lg mb-8">
            <div className="grid grid-cols-3 gap-4 text-right">
              <div>
                <p className="text-gray-600 text-sm">Subtotal</p>
                <p className="text-lg font-semibold">₹{totals.subtotal.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Tax</p>
                <p className="text-lg font-semibold">₹{totals.taxAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total</p>
                <p className="text-lg font-semibold text-indigo-600">₹{totals.total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Purchase'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/purchases')}
              className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

