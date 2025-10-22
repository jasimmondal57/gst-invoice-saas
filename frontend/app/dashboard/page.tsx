'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface DashboardStats {
  totalInvoices: number;
  totalRevenue: number;
  pendingInvoices: number;
  totalCustomers: number;
}

interface RecentInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'DRAFT';
  date: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    totalCustomers: 0,
  });

  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([
    { id: '1', invoiceNumber: 'INV-001', customerName: 'Acme Corp', amount: 50000, status: 'PAID', date: '2025-10-20' },
    { id: '2', invoiceNumber: 'INV-002', customerName: 'Tech Solutions', amount: 75000, status: 'PENDING', date: '2025-10-19' },
    { id: '3', invoiceNumber: 'INV-003', customerName: 'Global Traders', amount: 120000, status: 'PENDING', date: '2025-10-18' },
  ]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return { bg: 'rgba(76, 175, 80, 0.1)', text: 'var(--success)' };
      case 'PENDING':
        return { bg: 'rgba(255, 152, 0, 0.1)', text: 'var(--warning)' };
      case 'OVERDUE':
        return { bg: 'rgba(244, 67, 54, 0.1)', text: 'var(--error)' };
      default:
        return { bg: 'rgba(153, 153, 153, 0.1)', text: 'var(--text-light)' };
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--background-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-dark)' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-gray)' }}>Welcome back! Here's your business overview.</p>
        </div>

        {/* Key Metrics - Vyapaar Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Invoices */}
          <div className="rounded-lg p-6 border" style={{ backgroundColor: 'var(--white)', borderColor: 'var(--border-gray)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-light)' }}>Total Invoices</p>
                <p className="text-3xl font-bold mt-2" style={{ color: 'var(--text-dark)' }}>{stats.totalInvoices}</p>
                <p className="text-xs mt-2" style={{ color: 'var(--success)' }}>↑ 12% from last month</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: 'rgba(237, 26, 59, 0.1)', color: 'var(--primary)' }}>
                📄
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="rounded-lg p-6 border" style={{ backgroundColor: 'var(--white)', borderColor: 'var(--border-gray)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-light)' }}>Total Revenue</p>
                <p className="text-3xl font-bold mt-2" style={{ color: 'var(--text-dark)' }}>₹{(stats.totalRevenue / 100000).toFixed(1)}L</p>
                <p className="text-xs mt-2" style={{ color: 'var(--success)' }}>↑ 8% from last month</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', color: 'var(--success)' }}>
                💰
              </div>
            </div>
          </div>

          {/* Pending Invoices */}
          <div className="rounded-lg p-6 border" style={{ backgroundColor: 'var(--white)', borderColor: 'var(--border-gray)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-light)' }}>Pending Invoices</p>
                <p className="text-3xl font-bold mt-2" style={{ color: 'var(--text-dark)' }}>{stats.pendingInvoices}</p>
                <p className="text-xs mt-2" style={{ color: 'var(--warning)' }}>⚠️ Action needed</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: 'rgba(255, 152, 0, 0.1)', color: 'var(--warning)' }}>
                ⏳
              </div>
            </div>
          </div>

          {/* Total Customers */}
          <div className="rounded-lg p-6 border" style={{ backgroundColor: 'var(--white)', borderColor: 'var(--border-gray)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-light)' }}>Total Customers</p>
                <p className="text-3xl font-bold mt-2" style={{ color: 'var(--text-dark)' }}>{stats.totalCustomers}</p>
                <p className="text-xs mt-2" style={{ color: 'var(--success)' }}>↑ 5 new this month</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: 'rgba(33, 150, 243, 0.1)', color: 'var(--info)' }}>
                👥
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-dark)' }}>Quick Actions</h2>
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
                <div className="rounded-lg p-4 border transition hover:shadow-md cursor-pointer" style={{ backgroundColor: 'var(--white)', borderColor: 'var(--border-gray)' }}>
                  <div className="text-2xl mb-2">{action.icon}</div>
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--text-dark)' }}>{action.label}</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--white)', borderColor: 'var(--border-gray)' }}>
              <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-dark)' }}>Recent Invoices</h2>
              <div className="space-y-3">
                {recentInvoices.map((invoice) => {
                  const statusColor = getStatusColor(invoice.status);
                  return (
                    <div key={invoice.id} className="flex items-center justify-between p-4 rounded-lg border" style={{ backgroundColor: 'var(--light-gray)', borderColor: 'var(--border-gray)' }}>
                      <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--text-dark)' }}>{invoice.invoiceNumber}</p>
                        <p className="text-xs" style={{ color: 'var(--text-light)' }}>{invoice.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm" style={{ color: 'var(--text-dark)' }}>₹{invoice.amount.toLocaleString()}</p>
                        <span className="text-xs px-3 py-1 rounded-full inline-block mt-1" style={{ backgroundColor: statusColor.bg, color: statusColor.text }}>
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tips Card */}
            <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--white)', borderColor: 'var(--border-gray)' }}>
              <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-dark)' }}>💡 Pro Tips</h3>
              <ul className="space-y-2 text-xs" style={{ color: 'var(--text-gray)' }}>
                <li>✓ Use keyboard shortcuts for faster navigation</li>
                <li>✓ Set up recurring invoices to save time</li>
                <li>✓ Enable email reminders for pending payments</li>
              </ul>
            </div>

            {/* Help Card */}
            <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--white)', borderColor: 'var(--border-gray)' }}>
              <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-dark)' }}>📚 Need Help?</h3>
              <p className="text-xs mb-3" style={{ color: 'var(--text-gray)' }}>Check our documentation or contact support.</p>
              <button className="w-full py-2 rounded-lg text-sm font-medium text-white transition hover:opacity-90" style={{ backgroundColor: 'var(--primary)' }}>
                Get Help
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

