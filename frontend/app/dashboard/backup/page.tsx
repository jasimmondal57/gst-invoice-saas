'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

