'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, Card, CardHeader } from '@/components/VyapaarComponents';

interface Settings {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  gstNumber: string;
  panNumber: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({
    companyName: '',
    email: '',
    phone: '',
    address: '',
    gstNumber: '',
    panNumber: '',
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState('ORGANIZATION');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      router.push('/login');
      return;
    }
    setToken(authToken);
    fetchSettings(authToken);
  }, [router]);

  const fetchSettings = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/settings', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/settings', {
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
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
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
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>Company Name</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: 'var(--border-gray)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: 'var(--border-gray)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>Phone</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: 'var(--border-gray)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>Address</label>
              <textarea
                value={settings.address}
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
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>GST Number</label>
              <input
                type="text"
                value={settings.gstNumber}
                onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: 'var(--border-gray)' }}
                placeholder="27AABCT1234H1Z0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>PAN Number</label>
              <input
                type="text"
                value={settings.panNumber}
                onChange={(e) => setSettings({ ...settings, panNumber: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ borderColor: 'var(--border-gray)' }}
                placeholder="AAABCT1234H"
              />
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
            <div className="bg-blue-50 p-4 rounded-lg mb-4" style={{ backgroundColor: 'var(--light-gray)' }}>
              <p className="text-sm" style={{ color: 'var(--text-gray)' }}>API keys are used to authenticate requests to the GST Invoice SaaS API.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>API Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value="••••••••••••••••"
                    readOnly
                    className="flex-1 px-4 py-2 rounded-lg border"
                    style={{ borderColor: 'var(--border-gray)' }}
                  />
                  <PrimaryButton>Regenerate</PrimaryButton>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </VyapaarPage>
  );
}

