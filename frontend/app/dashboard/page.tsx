'use client';

import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome! 👋
          </h2>
          <p className="text-gray-600">
            You're logged in successfully. Start managing your invoices now.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Create Invoice */}
          <Link href="/dashboard/invoices/create">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Create Invoice</h3>
              <p className="text-gray-700 text-sm">Create a new GST invoice</p>
            </div>
          </Link>

          {/* View Invoices */}
          <Link href="/dashboard/invoices">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">View Invoices</h3>
              <p className="text-gray-700 text-sm">Manage all invoices</p>
            </div>
          </Link>

          {/* Customers */}
          <Link href="/dashboard/customers">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Customers</h3>
              <p className="text-gray-700 text-sm">Manage customers</p>
            </div>
          </Link>

          {/* Reports */}
          <Link href="/dashboard/reports">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Reports</h3>
              <p className="text-gray-700 text-sm">View GST reports</p>
            </div>
          </Link>

          {/* E-Invoices */}
          <Link href="/dashboard/e-invoices">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">E-Invoices</h3>
              <p className="text-gray-700 text-sm">Generate e-invoices with IRN</p>
            </div>
          </Link>

          {/* Expenses */}
          <Link href="/dashboard/expenses">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl mb-4">💸</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Expenses</h3>
              <p className="text-gray-700 text-sm">Track expenses</p>
            </div>
          </Link>

          {/* Products */}
          <Link href="/dashboard/products">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Products</h3>
              <p className="text-gray-700 text-sm">Manage products/services</p>
            </div>
          </Link>

          {/* Payments */}
          <Link href="/dashboard/payments">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Payments</h3>
              <p className="text-gray-700 text-sm">Track payments</p>
            </div>
          </Link>

          {/* Purchases */}
          <Link href="/dashboard/purchases">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Purchases</h3>
              <p className="text-gray-700 text-sm">Manage purchase orders</p>
            </div>
          </Link>

          {/* Inventory */}
          <Link href="/dashboard/inventory">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Inventory</h3>
              <p className="text-gray-700 text-sm">Track stock levels</p>
            </div>
          </Link>

          {/* Party Groups */}
          <Link href="/dashboard/party-groups">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Party Groups</h3>
              <p className="text-gray-700 text-sm">Organize customers & suppliers</p>
            </div>
          </Link>

          {/* Manufacturing */}
          <Link href="/dashboard/manufacturing">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl mb-4">🏭</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Manufacturing</h3>
              <p className="text-gray-700 text-sm">BOM & production orders</p>
            </div>
          </Link>

          {/* Users */}
          <Link href="/dashboard/users">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Users</h3>
              <p className="text-gray-700 text-sm">Manage team members</p>
            </div>
          </Link>

          {/* Backup */}
          <Link href="/dashboard/backup">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl mb-4">💾</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Backup & Export</h3>
              <p className="text-gray-700 text-sm">Backup & export data</p>
            </div>
          </Link>

          {/* Help */}
          <Link href="/dashboard/help">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl mb-4">❓</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Help & Support</h3>
              <p className="text-gray-700 text-sm">FAQs & tutorials</p>
            </div>
          </Link>

          {/* Settings */}
          <Link href="/dashboard/settings">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Settings</h3>
              <p className="text-gray-700 text-sm">Company & invoice settings</p>
            </div>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Invoices */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Invoices</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <div className="text-4xl">📄</div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">₹0</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>

          {/* Pending Invoices */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Invoices</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">Getting Started</h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>✅ Create your first invoice</li>
            <li>✅ Add customers to your account</li>
            <li>✅ Generate GST reports</li>
            <li>✅ Track payments and invoices</li>
          </ul>
        </div>
      </div>
    );
}

