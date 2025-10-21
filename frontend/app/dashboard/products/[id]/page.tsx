'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description?: string;
  hsn?: string;
  sac?: string;
  unit: string;
  price: number;
  gstRate: number;
  barcode?: string;
  lowStockAlert: number;
  inventory?: {
    quantity: number;
    reorderLevel: number;
    reorderQuantity: number;
    lastRestockDate?: string;
  };
  stockMovements?: Array<{
    id: string;
    type: string;
    quantity: number;
    notes?: string;
    createdAt: string;
  }>;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('ADD');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [adjustmentNotes, setAdjustmentNotes] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/v1/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const data = await response.json();
      setProduct(data);
      setError('');
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adjustmentQuantity || parseFloat(adjustmentQuantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const organizationId = localStorage.getItem('organizationId');

      const response = await fetch(`http://localhost:5000/api/v1/products/${productId}/inventory`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          organizationId,
          quantity: parseFloat(adjustmentQuantity),
          type: adjustmentType,
          notes: adjustmentNotes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update inventory');
      }

      setSuccess(`Stock ${adjustmentType.toLowerCase()} successfully!`);
      setAdjustmentQuantity('');
      setAdjustmentNotes('');
      
      // Refresh product data
      setTimeout(() => {
        fetchProduct();
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.error('Error updating inventory:', err);
      setError('Failed to update inventory');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Product not found</p>
          <button
            onClick={() => router.push('/dashboard/products')}
            className="text-blue-600 hover:text-blue-700 mt-4"
          >
            ← Back to Products
          </button>
        </div>
      </div>
    );
  }

  const currentStock = product.inventory?.quantity || 0;
  const isLowStock = currentStock <= product.lowStockAlert;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => router.push('/dashboard/products')}
          className="text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          ← Back to Products
        </button>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              {product.description && (
                <p className="text-gray-600 mb-6">{product.description}</p>
              )}
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="text-2xl font-bold text-gray-900">₹{product.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">GST Rate</p>
                  <p className="text-lg font-semibold text-gray-900">{product.gstRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Unit</p>
                  <p className="text-lg font-semibold text-gray-900">{product.unit}</p>
                </div>
              </div>
            </div>

            {/* Stock Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Stock Information</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Current Stock</p>
                  <p className={`text-3xl font-bold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                    {currentStock}
                  </p>
                  {isLowStock && (
                    <p className="text-sm text-red-600 mt-2">⚠️ Low stock alert!</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reorder Level</p>
                  <p className="text-lg font-semibold text-gray-900">{product.inventory?.reorderLevel || 10}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reorder Quantity</p>
                  <p className="text-lg font-semibold text-gray-900">{product.inventory?.reorderQuantity || 50}</p>
                </div>
                {product.inventory?.lastRestockDate && (
                  <div>
                    <p className="text-sm text-gray-600">Last Restocked</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(product.inventory.lastRestockDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Codes */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Codes</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {product.hsn && (
                <div>
                  <p className="text-sm text-gray-600">HSN Code</p>
                  <p className="text-lg font-semibold text-gray-900">{product.hsn}</p>
                </div>
              )}
              {product.sac && (
                <div>
                  <p className="text-sm text-gray-600">SAC Code</p>
                  <p className="text-lg font-semibold text-gray-900">{product.sac}</p>
                </div>
              )}
              {product.barcode && (
                <div>
                  <p className="text-sm text-gray-600">Barcode</p>
                  <p className="text-lg font-semibold text-gray-900">{product.barcode}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stock Adjustment */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Adjust Stock</h2>
          <form onSubmit={handleStockAdjustment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adjustment Type
                </label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ADD">Add Stock</option>
                  <option value="SUBTRACT">Remove Stock</option>
                  <option value="SET">Set Stock</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Update Stock
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={adjustmentNotes}
                onChange={(e) => setAdjustmentNotes(e.target.value)}
                placeholder="Add notes about this adjustment..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </form>
        </div>

        {/* Stock Movement History */}
        {product.stockMovements && product.stockMovements.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Stock Movement History</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {product.stockMovements.map((movement) => (
                    <tr key={movement.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(movement.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                          {movement.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{movement.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{movement.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

