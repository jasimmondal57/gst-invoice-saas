'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  gstRate: number;
  hsnCode: string;
  amount: number;
  gstAmount: number;
  discount: number;
  discountType: 'PERCENTAGE' | 'FIXED';
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

export default function CreateInvoicePage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState<{ [key: number]: boolean }>({});

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    supplierGSTIN: '',
    supplierName: '',
    supplierAddress: '',
    supplierState: '',
    supplierPincode: '',
    customerType: 'B2B' as 'B2B' | 'B2C',
    customerGSTIN: '',
    customerName: '',
    customerAddress: '',
    customerCity: '',
    customerState: '',
    customerPincode: '',
    customerEmail: '',
    customerPhone: '',
    transactionDiscount: 0,
    transactionDiscountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    paymentTerms: '',
    shippingAddress: '',
    notes: '',
    items: [{ id: '1', description: '', quantity: 1, unit: 'Nos', rate: 0, gstRate: 18, hsnCode: '', amount: 0, gstAmount: 0, discount: 0, discountType: 'PERCENTAGE' as const }],
  });

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    const orgId = localStorage.getItem('organizationId');
    if (!authToken) {
      router.push('/login');
    } else {
      setToken(authToken);
      setOrganizationId(orgId || '');
      fetchCompanySettings(authToken, orgId || '');
      fetchCustomers(authToken, orgId || '');
      fetchProducts(authToken, orgId || '');
      generateInvoiceNumber(authToken, orgId || '');
    }
  }, [router]);

  const generateInvoiceNumber = async (authToken: string, orgId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/invoices/generate-number/${orgId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
          invoiceNumber: data.invoiceNumber,
        }));
      }
    } catch (error) {
      console.error('Failed to generate invoice number:', error);
    }
  };

  const fetchCompanySettings = async (authToken: string, orgId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/organizations/${orgId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
          supplierGSTIN: data.gstin || '',
          supplierName: data.name || '',
          supplierAddress: data.address || '',
          supplierState: data.state || '',
          supplierPincode: data.pincode || '',
        }));
      }
    } catch (error) {
      console.error('Failed to fetch company settings:', error);
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

  const calculateAmount = (quantity: number, rate: number) => quantity * rate;
  const calculateDiscount = (amount: number, discount: number, discountType: 'PERCENTAGE' | 'FIXED') => {
    return discountType === 'PERCENTAGE' ? (amount * discount) / 100 : discount;
  };
  const calculateGST = (amount: number, gstRate: number) => (amount * gstRate) / 100;

  const handleCustomerSelect = (customer: Customer) => {
    setFormData((prev) => ({
      ...prev,
      customerType: customer.type,
      customerGSTIN: customer.gstin || '',
      customerName: customer.name,
      customerAddress: customer.address || '',
      customerCity: customer.city || '',
      customerState: customer.state || '',
      customerPincode: customer.pincode || '',
      customerEmail: customer.email || '',
      customerPhone: customer.phone || '',
    }));
    setShowCustomerDropdown(false);
  };

  const handleProductSelect = (index: number, product: Product) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      description: product.name,
      rate: product.price,
      gstRate: product.gstRate,
      unit: product.unit,
      hsnCode: product.hsn || '',
    };

    // Recalculate amount
    const baseAmount = newItems[index].quantity * newItems[index].rate;
    const discountAmount = calculateDiscount(baseAmount, newItems[index].discount, newItems[index].discountType);
    const amountAfterDiscount = baseAmount - discountAmount;
    const gstAmount = calculateGST(amountAfterDiscount, newItems[index].gstRate);
    newItems[index].amount = amountAfterDiscount;
    newItems[index].gstAmount = gstAmount;

    setFormData((prev) => ({ ...prev, items: newItems }));
    setShowProductDropdown((prev) => ({ ...prev, [index]: false }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'rate' || field === 'discount' || field === 'discountType') {
      const baseAmount = calculateAmount(newItems[index].quantity, newItems[index].rate);
      const discountAmount = calculateDiscount(baseAmount, newItems[index].discount, newItems[index].discountType);
      const amountAfterDiscount = baseAmount - discountAmount;
      const gstAmount = calculateGST(amountAfterDiscount, newItems[index].gstRate);
      newItems[index].amount = amountAfterDiscount;
      newItems[index].gstAmount = gstAmount;
    }

    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { id: Date.now().toString(), description: '', quantity: 1, unit: 'Nos', rate: 0, gstRate: 18, hsnCode: '', amount: 0, gstAmount: 0, discount: 0, discountType: 'PERCENTAGE' }],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const calculateTotals = () => {
    let subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    let totalGST = formData.items.reduce((sum, item) => sum + item.gstAmount, 0);

    // Apply transaction-level discount
    const transactionDiscount = calculateDiscount(subtotal, formData.transactionDiscount, formData.transactionDiscountType);
    subtotal -= transactionDiscount;

    return { subtotal, totalGST, transactionDiscount, total: subtotal + totalGST };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    try {
      // Validation
      if (!formData.customerName) {
        alert('Please select a customer');
        setLoading(false);
        return;
      }

      if (!formData.invoiceNumber) {
        alert('Invoice number is required');
        setLoading(false);
        return;
      }

      // Filter out empty items
      const validItems = formData.items.filter(item => item.description && item.quantity > 0 && item.rate > 0);

      if (validItems.length === 0) {
        alert('Please add at least one invoice item with description, quantity, and rate');
        setLoading(false);
        return;
      }

      // Find the selected customer ID
      const selectedCustomer = customers.find(c => c.name === formData.customerName);

      if (!selectedCustomer) {
        alert('Selected customer not found');
        setLoading(false);
        return;
      }

      // Only send required fields to backend
      const invoiceData = {
        organizationId,
        customerId: selectedCustomer.id,
        invoiceNumber: formData.invoiceNumber,
        invoiceDate: formData.invoiceDate,
        items: validItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit || 'Nos',
          rate: item.rate,
          gstRate: item.gstRate,
          hsnCode: item.hsnCode,
          discount: item.discount,
          discountType: item.discountType,
        })),
      };

      console.log('Creating invoice with data:', invoiceData);
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Organization ID:', organizationId);
      console.log('Customer ID:', selectedCustomer.id);
      console.log('Items count:', validItems.length);

      const response = await fetch('http://localhost:5000/api/v1/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(invoiceData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response type:', response.type);
      console.log('Response url:', response.url);

      if (response.ok) {
        setSuccess('Invoice created successfully!');
        setTimeout(() => router.push('/dashboard/invoices'), 2000);
      } else {
        let errorData = {};
        let errorMessage = `HTTP ${response.status}`;

        try {
          const text = await response.text();
          console.log('Response text:', text);
          console.log('Response text length:', text.length);

          if (text && text.trim()) {
            errorData = JSON.parse(text);
            errorMessage = errorData.error || errorData.details || errorMessage;
          } else {
            console.warn('Empty response body from server');
            errorMessage = `Server error (HTTP ${response.status}) - Empty response`;
          }
        } catch (e) {
          console.error('Failed to parse error response:', e);
          errorMessage = `Server error (HTTP ${response.status}) - Invalid JSON response`;
        }

        console.error('Error response:', errorData);
        console.error('Final error message:', errorMessage);
        alert('Failed to create invoice: ' + errorMessage);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Error creating invoice: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, totalGST, transactionDiscount, total } = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
          <div className="flex gap-2">
            <button onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{loading ? 'Creating...' : 'Create Invoice'}</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6 text-green-700">✓ {success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h2>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                <input type="text" value={formData.invoiceNumber} onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })} placeholder="INV-001" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                <input type="date" value={formData.invoiceDate} onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">From (Supplier)</h3>
              <div className="space-y-3">
                <input type="text" placeholder="GSTIN" value={formData.supplierGSTIN} onChange={(e) => setFormData({ ...formData, supplierGSTIN: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 text-sm" />
                <input type="text" placeholder="Business Name" value={formData.supplierName} onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 text-sm" />
                <textarea placeholder="Address" value={formData.supplierAddress} onChange={(e) => setFormData({ ...formData, supplierAddress: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 text-sm" rows={2} />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="State" value={formData.supplierState} onChange={(e) => setFormData({ ...formData, supplierState: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 text-sm" />
                  <input type="text" placeholder="Pincode" value={formData.supplierPincode} onChange={(e) => setFormData({ ...formData, supplierPincode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 text-sm" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">To (Customer)</h3>
                {formData.customerType && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    formData.customerType === 'B2B'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {formData.customerType}
                  </span>
                )}
              </div>
              <div className="space-y-3 relative">
                <div className="relative">
                  <input type="text" placeholder="Search customer..." value={formData.customerName} onChange={(e) => { setFormData({ ...formData, customerName: e.target.value }); setShowCustomerDropdown(true); }} onFocus={() => setShowCustomerDropdown(true)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 text-sm" />
                  {showCustomerDropdown && customers.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto z-20">
                      {customers.map((c) => (
                        <button key={c.id} type="button" onClick={() => handleCustomerSelect(c)} className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm text-gray-900">
                          <div className="flex justify-between items-center">
                            <span>{c.name}</span>
                            <span className={`text-xs px-2 py-1 rounded ${c.type === 'B2B' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{c.type}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {formData.customerType === 'B2B' && (
                  <input type="text" placeholder="GSTIN" value={formData.customerGSTIN} onChange={(e) => setFormData({ ...formData, customerGSTIN: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 text-sm" />
                )}
                <textarea placeholder="Address" value={formData.customerAddress} onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 text-sm" rows={2} />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="City" value={formData.customerCity} onChange={(e) => setFormData({ ...formData, customerCity: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 text-sm" />
                  <input type="text" placeholder="State" value={formData.customerState} onChange={(e) => setFormData({ ...formData, customerState: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 text-sm" />
                </div>
                <input type="text" placeholder="Pincode" value={formData.customerPincode} onChange={(e) => setFormData({ ...formData, customerPincode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 text-sm" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Product / Description</th>
                    <th className="px-4 py-2 text-right text-gray-700 font-medium">Qty</th>
                    <th className="px-4 py-2 text-center text-gray-700 font-medium">Unit</th>
                    <th className="px-4 py-2 text-right text-gray-700 font-medium">Rate</th>
                    <th className="px-4 py-2 text-right text-gray-700 font-medium">Discount</th>
                    <th className="px-4 py-2 text-right text-gray-700 font-medium">Amount</th>
                    <th className="px-4 py-2 text-right text-gray-700 font-medium">GST %</th>
                    <th className="px-4 py-2 text-right text-gray-700 font-medium">GST</th>
                    <th className="px-4 py-2 text-center text-gray-700 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-2 relative">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => { handleItemChange(index, 'description', e.target.value); setShowProductDropdown((prev) => ({ ...prev, [index]: true })); }}
                          onFocus={() => setShowProductDropdown((prev) => ({ ...prev, [index]: true }))}
                          placeholder="Search or type product name"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 placeholder-gray-500"
                        />
                        {showProductDropdown[index] && products.length > 0 && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-y-auto z-20">
                            {products.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => handleProductSelect(index, p)}
                                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm text-gray-900 border-b border-gray-100"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{p.name}</span>
                                  <span className="text-xs text-gray-500">₹{p.price}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2"><input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))} className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 text-right" /></td>
                      <td className="px-4 py-2"><select value={item.unit} onChange={(e) => handleItemChange(index, 'unit', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 text-sm"><option value="Nos">Nos</option><option value="Kg">Kg</option><option value="Ltr">Ltr</option><option value="Mtr">Mtr</option><option value="Box">Box</option><option value="Pcs">Pcs</option></select></td>
                      <td className="px-4 py-2"><input type="number" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value))} className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 text-right" /></td>
                      <td className="px-4 py-2"><div className="flex gap-1"><input type="number" value={item.discount} onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value))} className="w-16 px-2 py-1 border border-gray-300 rounded text-gray-900 text-right" /><select value={item.discountType} onChange={(e) => handleItemChange(index, 'discountType', e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-gray-900 text-xs"><option value="PERCENTAGE">%</option><option value="FIXED">₹</option></select></div></td>
                      <td className="px-4 py-2 text-right text-gray-900">₹{item.amount.toFixed(2)}</td>
                      <td className="px-4 py-2"><select value={item.gstRate} onChange={(e) => handleItemChange(index, 'gstRate', parseFloat(e.target.value))} className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900"><option>0</option><option>5</option><option>12</option><option>18</option><option>28</option></select></td>
                      <td className="px-4 py-2 text-right text-gray-900">₹{item.gstAmount.toFixed(2)}</td>
                      <td className="px-4 py-2 text-center"><button type="button" onClick={() => removeItem(index)} className="text-red-600 hover:text-red-700 font-medium">Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={addItem} className="mt-4 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium">+ Add Item</button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                  <input type="text" placeholder="e.g., Net 30, Due on receipt" value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                  <textarea placeholder="Shipping address (if different)" value={formData.shippingAddress} onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 text-sm" rows={2} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea placeholder="Additional notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 text-sm" rows={2} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-gray-700">Subtotal:</span><span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span></div>
                {transactionDiscount > 0 && <div className="flex justify-between text-red-600"><span>Transaction Discount:</span><span>-₹{transactionDiscount.toFixed(2)}</span></div>}
                <div className="flex justify-between"><span className="text-gray-700">Total GST:</span><span className="font-medium text-gray-900">₹{totalGST.toFixed(2)}</span></div>
                <div className="flex justify-between border-t border-gray-200 pt-2"><span className="text-lg font-semibold text-gray-900">Total:</span><span className="text-lg font-bold text-indigo-600">₹{total.toFixed(2)}</span></div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Discount</label>
                <div className="flex gap-2">
                  <input type="number" value={formData.transactionDiscount} onChange={(e) => setFormData({ ...formData, transactionDiscount: parseFloat(e.target.value) })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                  <select value={formData.transactionDiscountType} onChange={(e) => setFormData({ ...formData, transactionDiscountType: e.target.value as 'PERCENTAGE' | 'FIXED' })} className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900"><option value="PERCENTAGE">%</option><option value="FIXED">₹</option></select>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
