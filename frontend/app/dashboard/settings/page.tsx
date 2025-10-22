'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, Card, CardHeader } from '@/components/VyapaarComponents';

interface Settings {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstin?: string;
  pan?: string;
  apiKey?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({
    name: '',
    email: '',
    phone: '',
    address: '',
    gstin: '',
    pan: '',
    apiKey: '',
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [activeTab, setActiveTab] = useState('ORGANIZATION');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    const orgId = localStorage.getItem('organizationId');
    if (!authToken || !orgId) {
      router.push('/login');
      return;
    }
    setToken(authToken);
    setOrganizationId(orgId);
    fetchSettings(authToken, orgId);
  }, [router]);

  const fetchSettings = async (authToken: string, orgId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/organizations/${orgId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSettings({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          gstin: data.gstin || '',
          pan: data.pan || '',
          apiKey: data.apiKey || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setError('');
      const response = await fetch(`http://localhost:5000/api/v1/organizations/${organizationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setError('Failed to save settings');
    }
  };

  const tabs = [
    { id: 'ORGANIZATION', label: 'Organization', icon: '🏢' },
    { id: 'TAX', label: 'Tax Settings', icon: '📊' },
    { id: 'API', label: 'API Configuration', icon: '⚙️' },
  ];

  return (
    <VyapaarPage
      title="Settings"
      subtitle="Manage your business settings and preferences"
      loading={loading}
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b" style={{ borderColor: 'var(--border-gray)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-3 font-medium transition border-b-2"
            style={{
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-gray)',
              borderColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
            }}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Organization Settings */}
      {activeTab === 'ORGANIZATION' && (
        <Card>
          <CardHeader title="Organization Details" subtitle="Update your business information" />
          <div className="p-6 space-y-4">
            {error && <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--error)', color: 'white' }}>{error}</div>}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>Company Name</label>
              <input
                type="text"
                value={settings.name || ''}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: 'var(--border-gray)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>Email</label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: 'var(--border-gray)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>Phone</label>
              <input
                type="tel"
                value={settings.phone || ''}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: 'var(--border-gray)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>Address</label>
              <textarea
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: 'var(--border-gray)' }}
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
              {saved && <p className="text-sm" style={{ color: 'var(--success)' }}>✓ Settings saved successfully</p>}
            </div>
          </div>
        </Card>
      )}

      {/* Tax Settings */}
      {activeTab === 'TAX' && (
        <Card>
          <CardHeader title="Tax Settings" subtitle="Configure GST and tax information" />
          <div className="p-6 space-y-4">
            {error && <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--error)', color: 'white' }}>{error}</div>}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>GST Number (GSTIN)</label>
              <input
                type="text"
                value={settings.gstin || ''}
                onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: 'var(--border-gray)' }}
                placeholder="27AABCT1234H1Z0"
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-gray)' }}>15-character GST Identification Number</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>PAN Number</label>
              <input
                type="text"
                value={settings.pan || ''}
                onChange={(e) => setSettings({ ...settings, pan: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: 'var(--border-gray)' }}
                placeholder="AAABCT1234H"
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-gray)' }}>10-character Permanent Account Number</p>
            </div>
            <div className="flex gap-2 pt-4">
              <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
              {saved && <p className="text-sm" style={{ color: 'var(--success)' }}>✓ Settings saved successfully</p>}
            </div>
          </div>
        </Card>
      )}

      {/* API Configuration */}
      {activeTab === 'API' && (
        <Card>
          <CardHeader title="API Configuration" subtitle="Manage API keys and integrations" />
          <div className="p-6">
            {error && <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: 'var(--error)', color: 'white' }}>{error}</div>}
            <div className="bg-blue-50 p-4 rounded-lg mb-4" style={{ backgroundColor: 'var(--light-gray)' }}>
              <p className="text-sm" style={{ color: 'var(--text-gray)' }}>API keys are used to authenticate requests to the GST Invoice SaaS API. Keep your API key secure and never share it publicly.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>API Key</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.apiKey ? `${settings.apiKey.substring(0, 8)}...${settings.apiKey.substring(settings.apiKey.length - 8)}` : 'Not generated'}
                    readOnly
                    className="flex-1 px-4 py-2 rounded-lg border"
                    style={{ borderColor: 'var(--border-gray)' }}
                  />
                  <PrimaryButton onClick={() => {
                    const newKey = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                    setSettings({ ...settings, apiKey: newKey });
                  }}>Generate</PrimaryButton>
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--text-gray)' }}>Click "Generate" to create a new API key. Save it in a secure location.</p>
              </div>
              <div className="flex gap-2 pt-4">
                <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
                {saved && <p className="text-sm" style={{ color: 'var(--success)' }}>✓ Settings saved successfully</p>}
              </div>
            </div>
          </div>
        </Card>
      )}
    </VyapaarPage>
  );
}

