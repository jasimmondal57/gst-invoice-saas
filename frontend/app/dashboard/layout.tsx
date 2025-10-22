'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

const navigationItems = [
  // Core
  { label: 'Dashboard', href: '/dashboard', icon: '📊', category: 'Core' },
  { label: 'Invoices', href: '/dashboard/invoices', icon: '📄', category: 'Core' },
  { label: 'Customers', href: '/dashboard/customers', icon: '👥', category: 'Core' },
  { label: 'Products', href: '/dashboard/products', icon: '📦', category: 'Core' },

  // Inventory & Stock
  { label: 'Inventory', href: '/dashboard/inventory', icon: '📦', category: 'Inventory' },
  { label: 'Inventory Enhanced', href: '/dashboard/inventory-enhanced', icon: '📊', category: 'Inventory' },

  // Purchases & Suppliers
  { label: 'Purchases', href: '/dashboard/purchases', icon: '🛒', category: 'Purchases' },
  { label: 'Purchase Orders', href: '/dashboard/purchase-orders', icon: '📋', category: 'Purchases' },
  { label: 'Suppliers', href: '/dashboard/suppliers', icon: '🏢', category: 'Purchases' },

  // Payments & Financial
  { label: 'Payments', href: '/dashboard/payments', icon: '💳', category: 'Financial' },
  { label: 'Payment Reconciliation', href: '/dashboard/payment-reconciliation', icon: '✓', category: 'Financial' },
  { label: 'Expenses', href: '/dashboard/expenses', icon: '💸', category: 'Financial' },

  // Reports & Analytics
  { label: 'Reports', href: '/dashboard/reports', icon: '📈', category: 'Reports' },
  { label: 'Advanced Reports', href: '/dashboard/advanced-reports', icon: '📊', category: 'Reports' },

  // GST & Compliance
  { label: 'GST Compliance', href: '/dashboard/gst-compliance', icon: '📋', category: 'Compliance' },
  { label: 'E-Invoices', href: '/dashboard/e-invoices', icon: '📧', category: 'Compliance' },

  // Accounting
  { label: 'Accounting', href: '/dashboard/accounting', icon: '💰', category: 'Accounting' },

  // Bank & Cheque
  { label: 'Bank Reconciliation', href: '/dashboard/bank-reconciliation', icon: '🏦', category: 'Banking' },
  { label: 'Cheque Management', href: '/dashboard/cheque-management', icon: '✓', category: 'Banking' },

  // Multi-User & Management
  { label: 'Multi-User', href: '/dashboard/multi-user', icon: '👨‍💼', category: 'Management' },
  { label: 'Users', href: '/dashboard/users', icon: '👤', category: 'Management' },
  { label: 'Party Groups', href: '/dashboard/party-groups', icon: '🏷️', category: 'Management' },

  // Other
  { label: 'Manufacturing', href: '/dashboard/manufacturing', icon: '🏭', category: 'Other' },
  { label: 'Backup', href: '/dashboard/backup', icon: '💾', category: 'Other' },
  { label: 'Help', href: '/dashboard/help', icon: '❓', category: 'Other' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙️', category: 'Other' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (err) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('organizationId');
    router.push('/');
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background-secondary)' }}>
      {/* Top Navigation - Vyapaar Style */}
      <nav className="sticky top-0 z-40 border-b h-20 flex items-center" style={{ backgroundColor: 'var(--white)', borderColor: 'var(--border-gray)' }}>
        <div className="max-w-full px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg transition hover:bg-gray-100"
                style={{ color: 'var(--text-dark)' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-lg" style={{ backgroundColor: 'var(--primary)' }}>
                  V
                </div>
                <h1 className="text-xl font-bold hidden sm:block" style={{ color: 'var(--text-dark)' }}>Vyapaar</h1>
              </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-6">
              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--light-gray)' }}>
                <svg className="w-4 h-4" style={{ color: 'var(--text-light)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent outline-none text-sm w-40"
                  style={{ color: 'var(--text-dark)' }}
                />
              </div>

              {/* Notifications */}
              <button className="p-2 rounded-lg transition hover:bg-gray-100 relative" style={{ color: 'var(--text-gray)' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></span>
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-3 pl-4 border-l" style={{ borderColor: 'var(--border-gray)' }}>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-dark)' }}>
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-light)' }}>
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white transition hover:opacity-90"
                  style={{ backgroundColor: 'var(--primary)' }}
                  title="Logout"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar - Vyapaar Style */}
        {sidebarOpen && (
          <aside className="w-64 min-h-screen sticky top-20 border-r transition-all duration-300 overflow-y-auto" style={{ backgroundColor: 'var(--dark-bg)', borderColor: 'var(--border-gray)' }}>
            <nav className="p-4 space-y-4">
              {(() => {
                const categories = Array.from(new Set(navigationItems.map(item => item.category)));
                return categories.map((category) => (
                  <div key={category}>
                    <h3 className="text-xs font-bold uppercase px-4 py-2 mb-2 tracking-wider" style={{ color: '#CCCCCC', letterSpacing: '0.5px' }}>
                      {category}
                    </h3>
                    <div className="space-y-1">
                      {navigationItems
                        .filter(item => item.category === category)
                        .map((item) => {
                          // Exact match for dashboard, prefix match for others
                          const isActive = item.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname === item.href || pathname.startsWith(item.href + '/');
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-sm"
                              style={isActive ? {
                                backgroundColor: 'var(--primary)',
                                color: '#FFFFFF',
                                borderLeft: '4px solid #FFFFFF'
                              } : {
                                color: '#E0E0E0'
                              }}
                            >
                              <span className="text-lg">{item.icon}</span>
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                    </div>
                  </div>
                ));
              })()}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

