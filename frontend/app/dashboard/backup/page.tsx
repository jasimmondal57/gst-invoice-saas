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
