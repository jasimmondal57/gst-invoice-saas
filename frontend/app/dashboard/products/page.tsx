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
