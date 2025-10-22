'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, Card, CardHeader, StatusBadge } from '@/components/VyapaarComponents';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

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

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <VyapaarPage
      title="Users"
      subtitle="Manage team members and permissions"
      loading={loading}
      action={
        <PrimaryButton onClick={() => router.push('/dashboard/users/create')}>
          + Add User
        </PrimaryButton>
      }
      filters={
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-lg border text-sm flex-1"
            style={{ borderColor: 'var(--border-gray)' }}
          />
          {['ALL', 'ADMIN', 'MANAGER', 'USER'].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap"
              style={{
                backgroundColor: filterRole === role ? 'var(--primary)' : 'var(--white)',
                color: filterRole === role ? 'white' : 'var(--text-gray)',
                borderColor: filterRole === role ? 'var(--primary)' : 'var(--border-gray)',
                border: '1px solid',
              }}
            >
              {role}
            </button>
          ))}
        </div>
      }
    >
      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-dark)' }}>No users found</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>Add team members to collaborate</p>
          <PrimaryButton onClick={() => router.push('/dashboard/users/create')}>Add User</PrimaryButton>
        </Card>
      ) : (
        <Card>
          <CardHeader title={`Users (${filteredUsers.length})`} subtitle="Team members and their roles" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--light-gray)', borderBottom: '1px solid var(--border-gray)' }}>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50 cursor-pointer" style={{ borderColor: 'var(--border-gray)' }} onClick={() => router.push(`/dashboard/users/${user.id}`)}>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-dark)' }}>{user.name}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-dark)' }}>{user.email}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm"><StatusBadge status={user.status} /></td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
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
