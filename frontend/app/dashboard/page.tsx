'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface DashboardStats {
  totalInvoices: number;
  totalRevenue: number;
  pendingInvoices: number;
  totalCustomers: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    totalCustomers: 0,
  });

  useEffect(() => {
    // Fetch stats from API
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const orgId = localStorage.getItem('organizationId');

        const response = await fetch(`http://localhost:5000/api/dashboard/stats?organizationId=${orgId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--background-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--neutral-900)' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--neutral-500)' }}>Welcome back! Here's your business overview.</p>
        </div>

        {/* Key Metrics - Vyapaar Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Invoices */}
          <div className="rounded-lg p-6 border" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--neutral-200)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--neutral-500)' }}>Total Invoices</p>
                <p className="text-3xl font-bold mt-2" style={{ color: 'var(--neutral-900)' }}>{stats.totalInvoices}</p>
                <p className="text-xs mt-2" style={{ color: 'var(--success)' }}>↑ 12% from last month</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)' }}>
                📄
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="rounded-lg p-6 border" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--neutral-200)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--neutral-500)' }}>Total Revenue</p>
                <p className="text-3xl font-bold mt-2" style={{ color: 'var(--neutral-900)' }}>₹{(stats.totalRevenue / 100000).toFixed(1)}L</p>
                <p className="text-xs mt-2" style={{ color: 'var(--success)' }}>↑ 8% from last month</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: 'rgba(234, 88, 12, 0.1)', color: 'var(--secondary)' }}>
                💰
              </div>
            </div>
          </div>

          {/* Pending Invoices */}
          <div className="rounded-lg p-6 border" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--neutral-200)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--neutral-500)' }}>Pending Invoices</p>
                <p className="text-3xl font-bold mt-2" style={{ color: 'var(--neutral-900)' }}>{stats.pendingInvoices}</p>
                <p className="text-xs mt-2" style={{ color: 'var(--warning)' }}>⚠️ Action needed</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: 'rgba(234, 88, 12, 0.1)', color: 'var(--warning)' }}>
                ⏳
              </div>
            </div>
          </div>

          {/* Total Customers */}
          <div className="rounded-lg p-6 border" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--neutral-200)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--neutral-500)' }}>Total Customers</p>
                <p className="text-3xl font-bold mt-2" style={{ color: 'var(--neutral-900)' }}>{stats.totalCustomers}</p>
                <p className="text-xs mt-2" style={{ color: 'var(--success)' }}>↑ 5 new this month</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: 'rgba(8, 145, 178, 0.1)', color: 'var(--accent)' }}>
                👥
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--neutral-900)' }}>Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {[
              { href: '/dashboard/invoices/create', icon: '📄', label: 'Create Invoice', desc: 'New GST invoice' },
              { href: '/dashboard/invoices', icon: '📋', label: 'View Invoices', desc: 'Manage invoices' },
              { href: '/dashboard/customers', icon: '👥', label: 'Customers', desc: 'Manage customers' },
              { href: '/dashboard/payments', icon: '💳', label: 'Payments', desc: 'Track payments' },
              { href: '/dashboard/products', icon: '📦', label: 'Products', desc: 'Manage products' },
              { href: '/dashboard/inventory', icon: '📊', label: 'Inventory', desc: 'Stock levels' },
              { href: '/dashboard/reports', icon: '📈', label: 'Reports', desc: 'GST reports' },
              { href: '/dashboard/settings', icon: '⚙️', label: 'Settings', desc: 'Configuration' },
            ].map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="rounded-lg p-4 border transition hover:shadow-md cursor-pointer" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--neutral-200)' }}>
                  <div className="text-2xl mb-2">{action.icon}</div>
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--neutral-900)' }}>{action.label}</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--neutral-500)' }}>{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--neutral-200)' }}>
              <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--neutral-900)' }}>Recent Invoices</h2>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--neutral-50)' }}>
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--neutral-900)' }}>INV-00{i}</p>
                      <p className="text-xs" style={{ color: 'var(--neutral-500)' }}>Customer {i}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm" style={{ color: 'var(--neutral-900)' }}>₹{(i * 50000).toLocaleString()}</p>
                      <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: i === 1 ? 'rgba(22, 163, 74, 0.1)' : 'rgba(234, 88, 12, 0.1)', color: i === 1 ? 'var(--success)' : 'var(--warning)' }}>
                        {i === 1 ? 'PAID' : 'PENDING'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tips Card */}
            <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--neutral-200)' }}>
              <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--neutral-900)' }}>💡 Pro Tips</h3>
              <ul className="space-y-2 text-xs" style={{ color: 'var(--neutral-600)' }}>
                <li>✓ Use keyboard shortcuts for faster navigation</li>
                <li>✓ Set up recurring invoices to save time</li>
                <li>✓ Enable email reminders for pending payments</li>
              </ul>
            </div>

            {/* Help Card */}
            <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--neutral-200)' }}>
              <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--neutral-900)' }}>📚 Need Help?</h3>
              <p className="text-xs mb-3" style={{ color: 'var(--neutral-600)' }}>Check our documentation or contact support.</p>
              <button className="w-full py-2 rounded-lg text-sm font-medium text-white transition" style={{ backgroundColor: 'var(--primary)' }}>
                Get Help
              </button>
            </div>
          </div>
        </div>
      </div>
    );
}

