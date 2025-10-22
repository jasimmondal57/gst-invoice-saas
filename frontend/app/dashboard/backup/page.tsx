'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, Card, CardHeader } from '@/components/VyapaarComponents';

interface Backup {
  id: string;
  name: string;
  size: string;
  date: string;
  status: string;
}

export default function BackupPage() {
  const router = useRouter();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      router.push('/login');
      return;
    }
    setToken(authToken);
    fetchBackups(authToken);
  }, [router]);

  const fetchBackups = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/backups', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBackups(data);
      }
    } catch (error) {
      console.error('Failed to fetch backups:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VyapaarPage
      title="Backup & Restore"
      subtitle="Manage data backups and restore"
      loading={loading}
      action={
        <PrimaryButton onClick={() => alert('Creating backup...')}>
          + Create Backup
        </PrimaryButton>
      }
    >
      {/* Backup Options */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="cursor-pointer hover:shadow-lg transition">
          <div className="p-6">
            <div className="text-3xl mb-3">💾</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>Create Backup</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>Create a new backup of your data</p>
            <PrimaryButton className="w-full">Create Now</PrimaryButton>
          </div>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition">
          <div className="p-6">
            <div className="text-3xl mb-3">⚙️</div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>Auto Backup</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>Configure automatic backups</p>
            <PrimaryButton className="w-full">Configure</PrimaryButton>
          </div>
        </Card>
      </div>

      {/* Backups List */}
      {backups.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-dark)' }}>No backups</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>Create your first backup</p>
          <PrimaryButton onClick={() => alert('Creating backup...')}>Create Backup</PrimaryButton>
        </Card>
      ) : (
        <Card>
          <CardHeader title={`Backups (${backups.length})`} subtitle="All data backups" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--light-gray)', borderBottom: '1px solid var(--border-gray)' }}>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Backup Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Size</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((backup) => (
                  <tr key={backup.id} className="border-b hover:bg-gray-50" style={{ borderColor: 'var(--border-gray)' }}>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-dark)' }}>{backup.name}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{backup.size}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{new Date(backup.date).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm"><span className="px-2 py-1 rounded text-xs font-semibold" style={{ backgroundColor: 'var(--success)', color: 'white' }}>{backup.status}</span></td>
                    <td className="px-4 py-3 text-sm"><button className="text-blue-600 hover:underline">Download</button></td>
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

interface Backup {
  fileName: string;
  size: number;
  createdAt: string;
}

export default function BackupPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'backup' | 'export' | 'import'>('backup');

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    const orgId = localStorage.getItem('organizationId');
    if (!authToken) {
      router.push('/login');
    } else {
      setToken(authToken);
      setOrganizationId(orgId || '');
      fetchBackups(authToken, orgId || '');
    }
  }, [router]);

  const fetchBackups = async (authToken: string, orgId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/backup/list/${orgId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBackups(data.backups || []);
      }
    } catch (error) {
      console.error('Failed to fetch backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/backup/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ organizationId })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Backup created: ${data.fileName}`);
        fetchBackups(token, organizationId);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError('Failed to create backup');
    }
  };

  const handleDownloadBackup = async (fileName: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/backup/download/${fileName}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
      }
    } catch (error) {
      setError('Failed to download backup');
    }
  };

  const handleExportData = async (type: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/backup/export/${type}/${organizationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-${Date.now()}.json`;
        a.click();
        setSuccess(`${type} exported successfully!`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Data Backup & Export</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6 text-green-700">✓ {success}</div>}
        {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6 text-red-700">✗ {error}</div>}

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {[
            { id: 'backup', label: '💾 Backups' },
            { id: 'export', label: '📤 Export Data' },
            { id: 'import', label: '📥 Import Data' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Backups Tab */}
        {activeTab === 'backup' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Automatic Backups</h2>
            <button
              onClick={handleCreateBackup}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium mb-6"
            >
              + Create Backup Now
            </button>

            {backups.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-700 font-medium">Backup File</th>
                      <th className="px-6 py-3 text-right text-gray-700 font-medium">Size</th>
                      <th className="px-6 py-3 text-left text-gray-700 font-medium">Created</th>
                      <th className="px-6 py-3 text-center text-gray-700 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backups.map((backup) => (
                      <tr key={backup.fileName} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-900">{backup.fileName}</td>
                        <td className="px-6 py-4 text-right text-gray-600">
                          {(backup.size / 1024).toFixed(2)} KB
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(backup.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDownloadBackup(backup.fileName)}
                            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No backups yet. Create one to get started!</p>
            )}
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h2>
            <p className="text-gray-600 mb-6">Export your data in JSON format for backup or migration purposes.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { type: 'invoices', label: '📄 Invoices' },
                { type: 'purchases', label: '📦 Purchases' },
                { type: 'customers', label: '👥 Customers' },
                { type: 'suppliers', label: '🏢 Suppliers' }
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => handleExportData(item.type)}
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left font-medium text-gray-900"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Import Tab */}
        {activeTab === 'import' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Import Data</h2>
            <p className="text-gray-600 mb-6">Import data from JSON files. This will add new records to your existing data.</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">📁 Drag and drop JSON files here or click to select</p>
              <input
                type="file"
                accept=".json"
                className="hidden"
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium cursor-pointer inline-block"
              >
                Select File
              </label>
              <p className="text-sm text-gray-500 mt-4">Supported formats: JSON</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

