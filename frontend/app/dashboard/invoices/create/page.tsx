'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  hsnCode: string;
  amount: number;
  gstAmount: number;
  discount: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  gstType?: 'IGST' | 'SGST_CGST'; // IGST for interstate, SGST_CGST for intrastate
  sgstAmount?: number;
  cgstAmount?: number;
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

interface NewProductForm {
  name: string;
  description: string;
  hsn: string;
  sac: string;
  unit: string;
  price: string;
  gstRate: string;
  barcode: string;
  lowStockAlert: string;
}

interface NewCustomerForm {
  name: string;
  type: 'B2B' | 'B2C';
  gstin: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showCustomerSidebar, setShowCustomerSidebar] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState<{ [key: number]: boolean }>({});
  const [productSearchTerm, setProductSearchTerm] = useState<{ [key: number]: string }>({});
  const [showProductSidebar, setShowProductSidebar] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [newProductForm, setNewProductForm] = useState<NewProductForm>({
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
  const [newCustomerForm, setNewCustomerForm] = useState<NewCustomerForm>({
    name: '',
    type: 'B2B',
    gstin: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [editCustomerForm, setEditCustomerForm] = useState<NewCustomerForm>({
    name: '',
    type: 'B2B',
    gstin: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [customerContextMenu, setCustomerContextMenu] = useState<{ customerId: string; x: number; y: number } | null>(null);

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

  // Determine GST type based on supplier and customer states
  // IGST: Interstate (different states)
  // SGST+CGST: Intrastate (same state)
  const determineGSTType = (supplierState: string, customerState: string): 'IGST' | 'SGST_CGST' => {
    if (!supplierState || !customerState) return 'SGST_CGST'; // Default to intrastate
    return supplierState.toLowerCase().trim() === customerState.toLowerCase().trim() ? 'SGST_CGST' : 'IGST';
  };

  // Calculate GST amounts based on type
  const calculateGSTAmounts = (amount: number, gstRate: number, gstType: 'IGST' | 'SGST_CGST') => {
    const totalGST = (amount * gstRate) / 100;
    if (gstType === 'IGST') {
      return { gstAmount: totalGST, sgstAmount: 0, cgstAmount: 0 };
    } else {
      // For SGST+CGST, split equally
      const halfGST = totalGST / 2;
      return { gstAmount: totalGST, sgstAmount: halfGST, cgstAmount: halfGST };
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setFormData((prev) => {
      const gstType = determineGSTType(prev.supplierState, customer.state || '');

      // Update GST type for all items
      const updatedItems = prev.items.map((item) => {
        const gstAmounts = calculateGSTAmounts(item.amount, item.gstRate, gstType);
        return {
          ...item,
          gstType,
          gstAmount: gstAmounts.gstAmount,
          sgstAmount: gstAmounts.sgstAmount,
          cgstAmount: gstAmounts.cgstAmount,
        };
      });

      return {
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
        items: updatedItems,
      };
    });
    setShowCustomerSidebar(false);
  };

  const handleCreateCustomer = async () => {
    if (!newCustomerForm.name) {
      alert('Please fill in customer name');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/v1/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newCustomerForm,
          organizationId,
        }),
      });

      if (response.ok) {
        const newCustomer = await response.json();
        setCustomers([...customers, newCustomer]);
        handleCustomerSelect(newCustomer);

        // Reset form and close modal
        setNewCustomerForm({
          name: '',
          type: 'B2B',
          gstin: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
        });
        setShowCustomerModal(false);
      } else {
        alert('Failed to create customer');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Error creating customer');
    }
  };

  const handleEditCustomer = async () => {
    if (!editingCustomerId || !editCustomerForm.name) {
      alert('Please fill in customer name');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/v1/customers/${editingCustomerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...editCustomerForm,
          organizationId,
        }),
      });

      if (response.ok) {
        const updatedCustomer = await response.json();

        // Update customers list
        setCustomers(customers.map(c => c.id === editingCustomerId ? updatedCustomer : c));

        // If this customer is currently selected, update form data
        if (formData.customerName === editCustomerForm.name) {
          handleCustomerSelect(updatedCustomer);
        }

        // Reset form and close modal
        setEditCustomerForm({
          name: '',
          type: 'B2B',
          gstin: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
        });
        setEditingCustomerId(null);
        setShowEditCustomerModal(false);
        alert('Customer updated successfully!');
      } else {
        alert('Failed to update customer');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Error updating customer');
    }
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

    // Determine GST type and calculate amounts
    const gstType = determineGSTType(formData.supplierState, formData.customerState);
    const gstAmounts = calculateGSTAmounts(amountAfterDiscount, newItems[index].gstRate, gstType);

    newItems[index].amount = amountAfterDiscount;
    newItems[index].gstAmount = gstAmounts.gstAmount;
    newItems[index].sgstAmount = gstAmounts.sgstAmount;
    newItems[index].cgstAmount = gstAmounts.cgstAmount;
    newItems[index].gstType = gstType;

    setFormData((prev) => ({ ...prev, items: newItems }));
    setShowProductDropdown((prev) => ({ ...prev, [index]: false }));
    setProductSearchTerm((prev) => ({ ...prev, [index]: '' }));
  };

  const handleCreateProduct = async () => {
    if (!newProductForm.name || !newProductForm.price) {
      alert('Please fill in product name and price');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/v1/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newProductForm.name,
          description: newProductForm.description,
          hsn: newProductForm.hsn,
          sac: newProductForm.sac,
          unit: newProductForm.unit,
          price: parseFloat(newProductForm.price),
          gstRate: parseFloat(newProductForm.gstRate),
          barcode: newProductForm.barcode,
          lowStockAlert: parseInt(newProductForm.lowStockAlert),
          organizationId,
        }),
      });

      if (response.ok) {
        const newProduct = await response.json();
        setProducts([...products, newProduct]);

        // Auto-select the newly created product
        if (selectedItemIndex !== null) {
          handleProductSelect(selectedItemIndex, newProduct);
        }

        // Reset form and close modal
        setNewProductForm({
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
        setShowProductModal(false);
      } else {
        alert('Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error creating product');
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'rate' || field === 'discount' || field === 'discountType' || field === 'gstRate') {
      const baseAmount = calculateAmount(newItems[index].quantity, newItems[index].rate);
      const discountAmount = calculateDiscount(baseAmount, newItems[index].discount, newItems[index].discountType);
      const amountAfterDiscount = baseAmount - discountAmount;

      // Recalculate GST with current GST type
      const gstType = newItems[index].gstType || determineGSTType(formData.supplierState, formData.customerState);
      const gstAmounts = calculateGSTAmounts(amountAfterDiscount, newItems[index].gstRate, gstType);

      newItems[index].amount = amountAfterDiscount;
      newItems[index].gstAmount = gstAmounts.gstAmount;
      newItems[index].sgstAmount = gstAmounts.sgstAmount;
      newItems[index].cgstAmount = gstAmounts.cgstAmount;
      newItems[index].gstType = gstType;
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

          <div className="grid grid-cols-1 gap-6">
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
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowCustomerSidebar(true)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 hover:border-indigo-600 hover:bg-indigo-50 transition-all text-left font-medium"
                >
                  {formData.customerName ? `✓ ${formData.customerName}` : '👤 Select Customer'}
                </button>
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
            {/* GST Type Indicator */}
            {formData.items.length > 0 && (
              <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(237, 26, 59, 0.1)', borderLeft: '4px solid var(--primary)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                  {formData.items[0]?.gstType === 'IGST'
                    ? '🌍 INTERSTATE SALE - IGST Applied'
                    : '🏠 INTRASTATE SALE - SGST + CGST Applied'}
                </p>
              </div>
            )}
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full text-sm relative">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-700 font-medium">Product / Description</th>
                    <th className="px-4 py-2 text-right text-gray-700 font-medium">Qty</th>
                    <th className="px-4 py-2 text-center text-gray-700 font-medium">Unit</th>
                    <th className="px-4 py-2 text-right text-gray-700 font-medium">Rate</th>
                    <th className="px-4 py-2 text-right text-gray-700 font-medium">Discount</th>
                    <th className="px-4 py-2 text-right text-gray-700 font-medium">Taxable Value</th>
                    <th className="px-4 py-2 text-right text-gray-700 font-medium">GST %</th>
                    {formData.items.length > 0 && formData.items[0]?.gstType === 'IGST' ? (
                      <th className="px-4 py-2 text-right text-gray-700 font-medium">IGST</th>
                    ) : (
                      <>
                        <th className="px-4 py-2 text-right text-gray-700 font-medium">SGST</th>
                        <th className="px-4 py-2 text-right text-gray-700 font-medium">CGST</th>
                      </>
                    )}
                    <th className="px-4 py-2 text-center text-gray-700 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 relative">
                      <td className="px-4 py-2 relative z-10">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          onFocus={() => {
                            setSelectedItemIndex(index);
                            setShowProductSidebar(true);
                          }}
                          placeholder="Click to select product"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 placeholder-gray-500 cursor-pointer"
                          readOnly
                        />
                      </td>
                      <td className="px-4 py-2"><input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))} className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 text-right" /></td>
                      <td className="px-4 py-2"><select value={item.unit} onChange={(e) => handleItemChange(index, 'unit', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 text-sm"><option value="Nos">Nos</option><option value="Kg">Kg</option><option value="Ltr">Ltr</option><option value="Mtr">Mtr</option><option value="Box">Box</option><option value="Pcs">Pcs</option></select></td>
                      <td className="px-4 py-2"><input type="number" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value))} className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900 text-right" /></td>
                      <td className="px-4 py-2"><div className="flex gap-1"><input type="number" value={item.discount} onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value))} className="w-16 px-2 py-1 border border-gray-300 rounded text-gray-900 text-right" /><select value={item.discountType} onChange={(e) => handleItemChange(index, 'discountType', e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-gray-900 text-xs"><option value="PERCENTAGE">%</option><option value="FIXED">₹</option></select></div></td>
                      <td className="px-4 py-2 text-right text-gray-900 font-medium">₹{item.amount.toFixed(2)}</td>
                      <td className="px-4 py-2"><select value={item.gstRate} onChange={(e) => handleItemChange(index, 'gstRate', parseFloat(e.target.value))} className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900"><option>0</option><option>5</option><option>12</option><option>18</option><option>28</option></select></td>
                      {item.gstType === 'IGST' ? (
                        <td className="px-4 py-2 text-right text-gray-900 font-medium">₹{item.gstAmount.toFixed(2)}</td>
                      ) : (
                        <>
                          <td className="px-4 py-2 text-right text-gray-900 font-medium">₹{(item.sgstAmount || 0).toFixed(2)}</td>
                          <td className="px-4 py-2 text-right text-gray-900 font-medium">₹{(item.cgstAmount || 0).toFixed(2)}</td>
                        </>
                      )}
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

                {/* GST Breakdown */}
                {formData.items.length > 0 && formData.items[0]?.gstType === 'IGST' ? (
                  <div className="flex justify-between" style={{ color: 'var(--primary)' }}>
                    <span className="font-medium">IGST (Interstate):</span>
                    <span className="font-medium">₹{formData.items.reduce((sum, item) => sum + (item.gstAmount || 0), 0).toFixed(2)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between" style={{ color: 'var(--primary)' }}>
                      <span className="font-medium">SGST (State):</span>
                      <span className="font-medium">₹{formData.items.reduce((sum, item) => sum + (item.sgstAmount || 0), 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between" style={{ color: 'var(--primary)' }}>
                      <span className="font-medium">CGST (Central):</span>
                      <span className="font-medium">₹{formData.items.reduce((sum, item) => sum + (item.cgstAmount || 0), 0).toFixed(2)}</span>
                    </div>
                  </>
                )}

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

      {/* Product Sidebar Panel */}
      {showProductSidebar && (
        <>
          {/* Overlay - Light and non-intrusive */}
          <div
            className="fixed inset-0 z-40 transition-opacity duration-300 ease-out"
            onClick={() => setShowProductSidebar(false)}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
              backdropFilter: 'blur(4px)',
              animation: 'fadeIn 0.3s ease-out',
            }}
          />

          {/* Sidebar */}
          <div
            className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 flex flex-col"
            style={{
              animation: 'slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Header - Vyapaar Red */}
            <div
              className="px-6 py-5 flex justify-between items-center border-b-2"
              style={{
                backgroundColor: 'var(--primary)',
                borderColor: 'var(--primary)',
              }}
            >
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--white)' }}>
                  📦 Select Product
                </h2>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Choose from {products.length} products
                </p>
              </div>
              <button
                onClick={() => setShowProductSidebar(false)}
                className="rounded-full p-2 hover:opacity-80 transition-opacity"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <span style={{ color: 'var(--white)', fontSize: '24px' }}>✕</span>
              </button>
            </div>

            {/* Create Product Button - Vyapaar Style */}
            <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-gray)' }}>
              <button
                onClick={() => {
                  setSelectedItemIndex(selectedItemIndex);
                  setNewProductForm({
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
                  setShowProductModal(true);
                  setShowProductSidebar(false);
                }}
                className="w-full px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--white)',
                }}
              >
                <span>➕</span> Create New Product
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-gray)' }}>
              <input
                type="text"
                placeholder="🔍 Search products..."
                value={productSearchTerm[selectedItemIndex || 0] || ''}
                onChange={(e) => setProductSearchTerm((prev) => ({ ...prev, [selectedItemIndex || 0]: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border-2 transition-all duration-200 focus:outline-none"
                style={{
                  borderColor: 'var(--border-gray)',
                  color: 'var(--text-dark)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(237, 26, 59, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-gray)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Products List */}
            <div className="flex-1 overflow-y-auto">
              {products.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-5xl mb-3">📭</div>
                  <p className="font-medium" style={{ color: 'var(--text-dark)' }}>No products available</p>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-gray)' }}>Create a new product to get started</p>
                </div>
              ) : (
                <div>
                  {products
                    .filter((p) =>
                      p.name.toLowerCase().includes((productSearchTerm[selectedItemIndex || 0] || '').toLowerCase())
                    )
                    .map((product, idx) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          if (selectedItemIndex !== null) {
                            handleProductSelect(selectedItemIndex, product);
                          }
                          setShowProductSidebar(false);
                        }}
                        className="w-full text-left px-6 py-4 border-b transition-all duration-200 hover:pl-8 transform hover:scale-y-105"
                        style={{
                          borderColor: 'var(--border-gray)',
                          backgroundColor: 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--light-gray)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold" style={{ color: 'var(--text-dark)' }}>
                              {product.name}
                            </h3>
                            {product.description && (
                              <p className="text-xs mt-1" style={{ color: 'var(--text-gray)' }}>
                                {product.description}
                              </p>
                            )}
                            <div className="flex gap-3 mt-2 text-xs" style={{ color: 'var(--text-gray)' }}>
                              <span>📦 {product.unit}</span>
                              <span>🏷️ {product.gstRate}% GST</span>
                            </div>
                          </div>
                          <div className="text-right ml-4 flex-shrink-0">
                            <p className="font-bold text-lg" style={{ color: 'var(--primary)' }}>
                              ₹{product.price.toFixed(2)}
                            </p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-gray)' }}>
                              Price
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* CSS Animations */}
          <style>{`
            @keyframes slideInRight {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }

            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }

            @keyframes slideOutRight {
              from {
                transform: translateX(0);
                opacity: 1;
              }
              to {
                transform: translateX(100%);
                opacity: 0;
              }
            }
          `}</style>
        </>
      )}

      {/* Product Creation Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Create New Product</h2>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={newProductForm.name}
                    onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                    placeholder="e.g., Laptop"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                  <select
                    value={newProductForm.unit}
                    onChange={(e) => setNewProductForm({ ...newProductForm, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  >
                    <option value="Nos">Nos</option>
                    <option value="Kg">Kg</option>
                    <option value="Ltr">Ltr</option>
                    <option value="Mtr">Mtr</option>
                    <option value="Box">Box</option>
                    <option value="Pcs">Pcs</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newProductForm.description}
                  onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                  placeholder="Product description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">HSN Code</label>
                  <input
                    type="text"
                    value={newProductForm.hsn}
                    onChange={(e) => setNewProductForm({ ...newProductForm, hsn: e.target.value })}
                    placeholder="e.g., 8471"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SAC Code</label>
                  <input
                    type="text"
                    value={newProductForm.sac}
                    onChange={(e) => setNewProductForm({ ...newProductForm, sac: e.target.value })}
                    placeholder="e.g., 9983"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate (%)</label>
                  <select
                    value={newProductForm.gstRate}
                    onChange={(e) => setNewProductForm({ ...newProductForm, gstRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                  <input
                    type="text"
                    value={newProductForm.barcode}
                    onChange={(e) => setNewProductForm({ ...newProductForm, barcode: e.target.value })}
                    placeholder="e.g., 8901234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert (Qty)</label>
                  <input
                    type="number"
                    value={newProductForm.lowStockAlert}
                    onChange={(e) => setNewProductForm({ ...newProductForm, lowStockAlert: e.target.value })}
                    placeholder="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowProductModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProduct}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Create Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Sidebar Panel */}
      {showCustomerSidebar && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 transition-opacity duration-300 ease-out"
            onClick={() => {
              setShowCustomerSidebar(false);
              setCustomerContextMenu(null);
            }}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
              backdropFilter: 'blur(4px)',
              animation: 'fadeIn 0.3s ease-out',
            }}
          />

          {/* Sidebar */}
          <div
            className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 flex flex-col"
            style={{
              animation: 'slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Header */}
            <div
              className="px-6 py-5 flex justify-between items-center border-b-2"
              style={{
                backgroundColor: 'var(--primary)',
                borderColor: 'var(--primary)',
              }}
            >
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--white)' }}>
                  👤 Select Customer
                </h2>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  Choose from {customers.length} customers
                </p>
              </div>
              <button
                onClick={() => setShowCustomerSidebar(false)}
                className="rounded-full p-2 hover:opacity-80 transition-opacity"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <span style={{ color: 'var(--white)', fontSize: '24px' }}>✕</span>
              </button>
            </div>

            {/* Create Customer Button */}
            <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-gray)' }}>
              <button
                onClick={() => {
                  setNewCustomerForm({
                    name: '',
                    type: 'B2B',
                    gstin: '',
                    email: '',
                    phone: '',
                    address: '',
                    city: '',
                    state: '',
                    pincode: '',
                  });
                  setShowCustomerModal(true);
                  setShowCustomerSidebar(false);
                }}
                className="w-full px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--white)',
                }}
              >
                <span>➕</span> Create New Customer
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-gray)' }}>
              <input
                type="text"
                placeholder="🔍 Search customers..."
                value={customerSearchTerm}
                onChange={(e) => setCustomerSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 transition-all duration-200 focus:outline-none"
                style={{
                  borderColor: 'var(--border-gray)',
                  color: 'var(--text-dark)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(237, 26, 59, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-gray)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Customers List */}
            <div className="flex-1 overflow-y-auto">
              {customers.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-5xl mb-3">👥</div>
                  <p className="font-medium" style={{ color: 'var(--text-dark)' }}>No customers available</p>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-gray)' }}>Create a new customer to get started</p>
                </div>
              ) : (
                <div>
                  {customers
                    .filter((c) =>
                      c.name.toLowerCase().includes(customerSearchTerm.toLowerCase())
                    )
                    .map((customer) => (
                      <div
                        key={customer.id}
                        className="w-full px-6 py-4 border-b transition-all duration-200 flex justify-between items-start gap-3 group"
                        style={{
                          borderColor: 'var(--border-gray)',
                          backgroundColor: 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--light-gray)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <button
                          onClick={() => {
                            handleCustomerSelect(customer);
                            setShowCustomerSidebar(false);
                          }}
                          className="flex-1 text-left"
                        >
                          <h3 className="font-semibold" style={{ color: 'var(--text-dark)' }}>
                            {customer.name}
                          </h3>
                          {customer.email && (
                            <p className="text-xs mt-1" style={{ color: 'var(--text-gray)' }}>
                              📧 {customer.email}
                            </p>
                          )}
                          <div className="flex gap-3 mt-2 text-xs flex-wrap" style={{ color: 'var(--text-gray)' }}>
                            <span className={`px-2 py-1 rounded ${customer.type === 'B2B' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                              {customer.type}
                            </span>
                            {customer.state && <span>📍 {customer.state}</span>}
                            {customer.phone && <span>📱 {customer.phone}</span>}
                          </div>
                        </button>

                        {/* Context Menu Button */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              setCustomerContextMenu({
                                customerId: customer.id,
                                x: rect.right - 150,
                                y: rect.bottom + 5,
                              });
                            }}
                            className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 opacity-0 group-hover:opacity-100"
                            style={{
                              backgroundColor: 'var(--primary)',
                              color: 'var(--white)',
                            }}
                          >
                            ⋮ Menu
                          </button>

                          {/* Context Menu Dropdown */}
                          {customerContextMenu?.customerId === customer.id && (
                            <div
                              className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 min-w-max"
                              style={{
                                top: `${customerContextMenu.y}px`,
                                left: `${customerContextMenu.x}px`,
                              }}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCustomerId(customer.id);
                                  setEditCustomerForm({
                                    name: customer.name,
                                    type: customer.type,
                                    gstin: customer.gstin || '',
                                    email: customer.email || '',
                                    phone: customer.phone || '',
                                    address: customer.address || '',
                                    city: customer.city || '',
                                    state: customer.state || '',
                                    pincode: customer.pincode || '',
                                  });
                                  setShowEditCustomerModal(true);
                                  setCustomerContextMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-900 font-medium border-b border-gray-200"
                              >
                                ✏️ Edit Details
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCustomerSelect(customer);
                                  setShowCustomerSidebar(false);
                                  setCustomerContextMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-900 font-medium border-b border-gray-200"
                              >
                                ✓ Select Customer
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCustomerContextMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-600 font-medium"
                              >
                                ✕ Close
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* CSS Animations */}
          <style>{`
            @keyframes slideInRight {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }

            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
          `}</style>
        </>
      )}

      {/* Create Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Create New Customer</h2>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    value={newCustomerForm.name}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                    placeholder="Enter customer name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newCustomerForm.type}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, type: e.target.value as 'B2B' | 'B2C' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  >
                    <option value="B2B">B2B</option>
                    <option value="B2C">B2C</option>
                  </select>
                </div>
              </div>

              {newCustomerForm.type === 'B2B' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={newCustomerForm.gstin}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, gstin: e.target.value })}
                    placeholder="Enter GSTIN"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newCustomerForm.email}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                    placeholder="Enter email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                    placeholder="Enter phone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={newCustomerForm.address}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                  placeholder="Enter address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={newCustomerForm.city}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, city: e.target.value })}
                    placeholder="Enter city"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <select
                    value={newCustomerForm.state}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={newCustomerForm.pincode}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, pincode: e.target.value })}
                    placeholder="Enter pincode"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowCustomerModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomer}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Create Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Edit Customer Address</h2>
              <button
                onClick={() => setShowEditCustomerModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={editCustomerForm.name}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, name: e.target.value })}
                    placeholder="Enter customer name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={editCustomerForm.type}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, type: e.target.value as 'B2B' | 'B2C' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  >
                    <option value="B2B">B2B</option>
                    <option value="B2C">B2C</option>
                  </select>
                </div>
              </div>

              {editCustomerForm.type === 'B2B' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={editCustomerForm.gstin}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, gstin: e.target.value })}
                    placeholder="Enter GSTIN"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editCustomerForm.email}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, email: e.target.value })}
                    placeholder="Enter email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editCustomerForm.phone}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, phone: e.target.value })}
                    placeholder="Enter phone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={editCustomerForm.address}
                  onChange={(e) => setEditCustomerForm({ ...editCustomerForm, address: e.target.value })}
                  placeholder="Enter address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editCustomerForm.city}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, city: e.target.value })}
                    placeholder="Enter city"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <select
                    value={editCustomerForm.state}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={editCustomerForm.pincode}
                    onChange={(e) => setEditCustomerForm({ ...editCustomerForm, pincode: e.target.value })}
                    placeholder="Enter pincode"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowEditCustomerModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleEditCustomer}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Update Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
