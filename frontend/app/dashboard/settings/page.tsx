'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOrganizationId } from '@/lib/organizationHelper';

interface CompanySettings {
  id?: string;
  name: string;
  gstin: string;
  pan: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  logo?: string;
  website?: string;
  businessType?: string;
  bankName?: string;
  bankAccount?: string;
  bankIFSC?: string;
  invoicePrefix?: string;
  invoiceStartNumber?: number;
  invoiceTemplate?: string;
  defaultDueDate?: number;
  paymentTerms?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('company');

  const [formData, setFormData] = useState<CompanySettings>({
    name: '',
    gstin: '',
    pan: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    logo: '',
    website: '',
    businessType: '',
    bankName: '',
    bankAccount: '',
    bankIFSC: '',
    invoicePrefix: 'INV-',
    invoiceStartNumber: 1,
    invoiceTemplate: 'standard',
    defaultDueDate: 30,
    paymentTerms: '',
  });

  useEffect(() => {
    const initializeSettings = async () => {
      const authToken = localStorage.getItem('token');
      console.log('Settings page - Auth token:', authToken ? 'Present' : 'Missing');

      if (!authToken) {
        router.push('/login');
        return;
      }

      setToken(authToken);

      // Get organization ID (from localStorage or fetch from backend)
      console.log('Settings page - Getting organization ID...');
      const orgId = await getOrganizationId(authToken);
      console.log('Settings page - Organization ID:', orgId);

      if (orgId) {
        setOrganizationId(orgId);
        console.log('Settings page - Fetching company settings for org:', orgId);
        fetchCompanySettings(authToken, orgId);
      } else {
        console.error('Settings page - Failed to get organization ID');
        setError('Failed to load organization. Please try logging in again.');
      }
    };

    initializeSettings();
  }, [router]);

  const fetchCompanySettings = async (authToken: string, orgId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/organizations/${orgId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        // Convert null values to empty strings to prevent React warnings
        const sanitizedData = Object.keys(data).reduce((acc, key) => {
          acc[key] = data[key] === null ? '' : data[key];
          return acc;
        }, {} as any);
        setFormData((prev) => ({ ...prev, ...sanitizedData }));
      }
    } catch (error) {
      console.error('Failed to fetch company settings:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'invoiceStartNumber' || name === 'defaultDueDate' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      // Remove id field before sending to backend
      const { id, ...dataToSend } = formData;

      console.log('Submitting form data:', dataToSend);
      console.log('Organization ID:', organizationId);
      console.log('Token:', token ? 'Present' : 'Missing');

      const response = await fetch(`http://localhost:5000/api/v1/organizations/${organizationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        setSuccess('Settings saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        let errorMessage = 'Failed to save settings';
        try {
          const errorData = await response.json();
          console.log('Error data:', errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          console.log('Failed to parse JSON, trying text...');
          const text = await response.text();
          console.error('Response text:', text);
          errorMessage = `Error (${response.status}): ${text || 'Unknown error'}`;
        }
        setError(errorMessage);
        console.error('Save error - Status:', response.status, 'Message:', errorMessage);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError('Error saving settings: ' + errorMsg);
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6 text-green-700">✓ {success}</div>}
        {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6 text-red-700">✗ {error}</div>}

        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200 flex">
            <button
              onClick={() => setActiveTab('company')}
              className={`px-6 py-4 font-medium border-b-2 ${activeTab === 'company' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-700 hover:text-gray-900'}`}
            >
              Company Profile
            </button>
            <button
              onClick={() => setActiveTab('invoice')}
              className={`px-6 py-4 font-medium border-b-2 ${activeTab === 'invoice' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-700 hover:text-gray-900'}`}
            >
              Invoice Settings
            </button>
            <button
              onClick={() => setActiveTab('bank')}
              className={`px-6 py-4 font-medium border-b-2 ${activeTab === 'bank' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-700 hover:text-gray-900'}`}
            >
              Bank Details
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {activeTab === 'company' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Company Profile</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN *</label>
                    <input type="text" name="gstin" value={formData.gstin} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PAN</label>
                    <input type="text" name="pan" value={formData.pan} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                    <input type="text" name="businessType" value={formData.businessType} onChange={handleInputChange} placeholder="e.g., Retail, Manufacturing" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input type="url" name="website" value={formData.website} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} required rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500" />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input type="text" name="state" value={formData.state} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input type="text" name="country" value={formData.country} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'invoice' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Invoice Settings</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Prefix</label>
                    <input type="text" name="invoicePrefix" value={formData.invoicePrefix} onChange={handleInputChange} placeholder="e.g., INV-" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Starting Invoice Number</label>
                    <input type="number" name="invoiceStartNumber" value={formData.invoiceStartNumber} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Template</label>
                    <select name="invoiceTemplate" value={formData.invoiceTemplate} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                      <option value="standard">Standard</option>
                      <option value="professional">Professional</option>
                      <option value="minimal">Minimal</option>
                      <option value="detailed">Detailed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Due Date (Days)</label>
                    <input type="number" name="defaultDueDate" value={formData.defaultDueDate} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                  <textarea name="paymentTerms" value={formData.paymentTerms} onChange={handleInputChange} placeholder="e.g., Payment due within 30 days of invoice date" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500" />
                </div>
              </div>
            )}

            {activeTab === 'bank' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Bank Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input type="text" name="bankName" value={formData.bankName} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input type="text" name="bankAccount" value={formData.bankAccount} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                    <input type="text" name="bankIFSC" value={formData.bankIFSC} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{loading ? 'Saving...' : 'Save Settings'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

