'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, Card, CardHeader } from '@/components/VyapaarComponents';

interface PartyGroup {
  id: string;
  name: string;
  type: string;
  members: number;
  createdDate: string;
}

export default function PartyGroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<PartyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      router.push('/login');
      return;
    }
    setToken(authToken);
    fetchPartyGroups(authToken);
  }, [router]);

  const fetchPartyGroups = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/party-groups', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Failed to fetch party groups:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VyapaarPage
      title="Party Groups"
      subtitle="Organize customers and suppliers into groups"
      loading={loading}
      action={
        <PrimaryButton onClick={() => router.push('/dashboard/party-groups/create')}>
          + Create Group
        </PrimaryButton>
      }
    >
      {/* Party Groups List */}
      {groups.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">👫</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-dark)' }}>No party groups</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>Create groups to organize parties</p>
          <PrimaryButton onClick={() => router.push('/dashboard/party-groups/create')}>Create Group</PrimaryButton>
        </Card>
      ) : (
        <Card>
          <CardHeader title={`Party Groups (${groups.length})`} subtitle="All party groups" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--light-gray)', borderBottom: '1px solid var(--border-gray)' }}>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Group Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Members</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group.id} className="border-b hover:bg-gray-50 cursor-pointer" style={{ borderColor: 'var(--border-gray)' }} onClick={() => router.push(`/dashboard/party-groups/${group.id}`)}>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-dark)' }}>{group.name}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{group.type}</td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>{group.members}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{new Date(group.createdDate).toLocaleDateString('en-IN')}</td>
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
