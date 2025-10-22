'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, Card, CardHeader } from '@/components/VyapaarComponents';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function MultiUserPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      router.push('/login');
      return;
    }
    setToken(authToken);
    fetchUsers(authToken);
  }, [router]);

  const fetchUsers = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/users', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VyapaarPage
      title="Multi-User Management"
      subtitle="Manage team members and permissions"
      loading={loading}
      action={
        <PrimaryButton onClick={() => router.push('/dashboard/multi-user/invite')}>
          + Invite User
        </PrimaryButton>
      }
    >
      {/* Users List */}
      {users.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-dark)' }}>No team members</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>Invite team members to collaborate</p>
          <PrimaryButton onClick={() => router.push('/dashboard/multi-user/invite')}>Invite User</PrimaryButton>
        </Card>
      ) : (
        <Card>
          <CardHeader title={`Team Members (${users.length})`} subtitle="All team members and their roles" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--light-gray)', borderBottom: '1px solid var(--border-gray)' }}>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50" style={{ borderColor: 'var(--border-gray)' }}>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-dark)' }}>{user.name}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{user.email}</td>
                    <td className="px-4 py-3 text-sm"><span className="px-2 py-1 rounded text-xs font-semibold" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>{user.role}</span></td>
                    <td className="px-4 py-3 text-sm"><span className="px-2 py-1 rounded text-xs font-semibold" style={{ backgroundColor: 'var(--success)', color: 'white' }}>{user.status}</span></td>
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
