'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, SecondaryButton, FormInput, FormSelect, Card, CardHeader, StatusBadge, Alert } from '@/components/VyapaarComponents';

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
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hsn: '',
    sac: '',
    unit: 'Nos',
    price: '',
    gstRate: '18',
    barcode: '',
    lowStockAlert: '10',
  });

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      router.push('/login');
      return;
    }
    setToken(authToken);
    fetchProducts(authToken);
  }, [router]);

  const fetchProducts = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/products', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
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

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price) newErrors.price = 'Price is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/v1/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('Product added successfully!');
        setFormData({ name: '', description: '', hsn: '', sac: '', unit: 'Nos', price: '', gstRate: '18', barcode: '', lowStockAlert: '10' });
        setShowForm(false);
        fetchProducts(token);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Failed to add product:', error);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <VyapaarPage
      title="Products"
      subtitle="Manage your products and inventory"
      loading={loading}
      action={
        <PrimaryButton onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Product'}
        </PrimaryButton>
      }
      filters={
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-lg border text-sm"
            style={{ borderColor: 'var(--border-gray)' }}
          />
        </div>
      }
    >
      {/* Add Product Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader title="Add New Product" subtitle="Enter product details" />
          {success && <Alert type="success" message={`✓ ${success}`} />}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Product Name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                required
              />
              <FormInput
                label="Price"
                placeholder="0.00"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                error={errors.price}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="Unit"
                options={[
                  { value: 'Nos', label: 'Nos (Numbers)' },
                  { value: 'Kg', label: 'Kg (Kilograms)' },
                  { value: 'L', label: 'L (Liters)' },
                  { value: 'M', label: 'M (Meters)' },
                ]}
                value={formData.unit}
                onChange={handleInputChange}
              />
              <FormSelect
                label="GST Rate (%)"
                options={[
                  { value: '0', label: '0%' },
                  { value: '5', label: '5%' },
                  { value: '12', label: '12%' },
                  { value: '18', label: '18%' },
                  { value: '28', label: '28%' },
                ]}
                value={formData.gstRate}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput label="HSN Code" placeholder="HSN code" value={formData.hsn} onChange={handleInputChange} />
              <FormInput label="SAC Code" placeholder="SAC code" value={formData.sac} onChange={handleInputChange} />
            </div>

            <FormInput label="Description" placeholder="Product description" value={formData.description} onChange={handleInputChange} />

            <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-gray)' }}>
              <PrimaryButton onClick={handleSubmit}>Save Product</PrimaryButton>
              <SecondaryButton onClick={() => setShowForm(false)}>Cancel</SecondaryButton>
            </div>
          </form>
        </Card>
      )}

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-dark)' }}>No products yet</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>Add your first product to get started</p>
          <PrimaryButton onClick={() => setShowForm(true)}>Add Product</PrimaryButton>
        </Card>
      ) : (
        <Card>
          <CardHeader title={`Products (${filteredProducts.length})`} subtitle="All your products" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--light-gray)', borderBottom: '1px solid var(--border-gray)' }}>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Unit</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>GST Rate</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>HSN/SAC</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50" style={{ borderColor: 'var(--border-gray)' }}>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-dark)' }}>{product.name}</td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>₹{product.price.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{product.unit}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{product.gstRate}%</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{product.hsn || product.sac || '-'}</td>
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
}

interface FormErrors {
  [key: string]: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hsn: '',
    sac: '',
    unit: 'Nos',
    price: '',
    gstRate: '18',
    barcode: '',
    lowStockAlert: '10',
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
    fetchProducts(authToken, orgId || '');
  }, [router]);

  const fetchProducts = async (authToken: string, orgId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/products?organizationId=${orgId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price) newErrors.price = 'Price is required';
    else if (isNaN(parseFloat(formData.price))) newErrors.price = 'Price must be a number';
    if (!formData.gstRate) newErrors.gstRate = 'GST rate is required';
    else if (isNaN(parseFloat(formData.gstRate))) newErrors.gstRate = 'GST rate must be a number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const productData = {
        organizationId,
        name: formData.name,
        description: formData.description || null,
        hsn: formData.hsn || null,
        sac: formData.sac || null,
        unit: formData.unit,
        price: parseFloat(formData.price),
        gstRate: parseFloat(formData.gstRate),
        barcode: formData.barcode || null,
        lowStockAlert: parseFloat(formData.lowStockAlert) || 10,
      };

      const url = editingId
        ? `http://localhost:5000/api/v1/products/${editingId}`
        : 'http://localhost:5000/api/v1/products';

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        setSuccess(editingId ? 'Product updated successfully!' : 'Product created successfully!');
        setFormData({
          name: '',
          description: '',
          hsn: '',
          sac: '',
          unit: 'Nos',
          price: '',
          gstRate: '18',
          barcode: '',
          lowStockAlert: '10',
        });
        setShowForm(false);
        setEditingId(null);
        fetchProducts(token, organizationId);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        alert('Failed to save product: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      hsn: product.hsn || '',
      sac: product.sac || '',
      unit: product.unit,
      price: product.price.toString(),
      gstRate: product.gstRate.toString(),
      barcode: product.barcode || '',
      lowStockAlert: product.lowStockAlert.toString(),
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/v1/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSuccess('Product deleted successfully!');
        fetchProducts(token, organizationId);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.hsn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products & Services</h1>
              <p className="text-gray-600 mt-1">Manage your product catalog</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
            >
              {showForm ? '✕ Cancel' : '+ Add Product'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
            {success}
          </div>
        )}

        {/* Add Product Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* HSN Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">HSN Code</label>
                <input
                  type="text"
                  name="hsn"
                  value={formData.hsn}
                  onChange={handleInputChange}
                  placeholder="Enter HSN code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* SAC Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SAC Code</label>
                <input
                  type="text"
                  name="sac"
                  value={formData.sac}
                  onChange={handleInputChange}
                  placeholder="Enter SAC code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Nos">Nos (Numbers)</option>
                  <option value="Kg">Kg (Kilograms)</option>
                  <option value="Ltr">Ltr (Liters)</option>
                  <option value="Mtr">Mtr (Meters)</option>
                  <option value="Box">Box</option>
                  <option value="Pcs">Pcs (Pieces)</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  step="0.01"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              {/* GST Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Rate (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="gstRate"
                  value={formData.gstRate}
                  onChange={handleInputChange}
                  placeholder="Enter GST rate"
                  step="0.01"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${
                    errors.gstRate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.gstRate && <p className="text-red-500 text-sm mt-1">{errors.gstRate}</p>}
              </div>

              {/* Barcode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Barcode</label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  placeholder="Enter barcode"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Low Stock Alert */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Alert</label>
                <input
                  type="number"
                  name="lowStockAlert"
                  value={formData.lowStockAlert}
                  onChange={handleInputChange}
                  placeholder="Enter low stock alert level"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400"
                >
                  {loading ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products by name, HSN, or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Products List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {products.length === 0 ? 'No products yet. Create your first product!' : 'No products match your search.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">HSN</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Unit</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">GST %</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.hsn || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.unit}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">₹{product.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.gstRate}%</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

