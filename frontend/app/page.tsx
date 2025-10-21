'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">📊 InvoiceHub</h1>
            </div>
            <div className="flex gap-4">
              <Link href="/login" className="px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium">
                Login
              </Link>
              <Link href="/register" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            GST Invoice Management Made Easy
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create, manage, and track GST-compliant invoices with ease. Perfect for Indian businesses of all sizes.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register" className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-lg">
              Get Started Free
            </Link>
            <Link href="#features" className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-semibold text-lg">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Powerful Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <div className="text-4xl mb-4">📄</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">GST Invoicing</h4>
              <p className="text-gray-600">
                Create professional GST-compliant invoices with automatic tax calculations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <div className="text-4xl mb-4">✅</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">E-Invoice Support</h4>
              <p className="text-gray-600">
                Generate e-invoices with IRN and QR codes for compliance.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <div className="text-4xl mb-4">📦</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Inventory Management</h4>
              <p className="text-gray-600">
                Track products and inventory with HSN/SAC codes.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <div className="text-4xl mb-4">💰</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Expense Tracking</h4>
              <p className="text-gray-600">
                Monitor expenses and manage business finances efficiently.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <div className="text-4xl mb-4">📊</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">GST Reports</h4>
              <p className="text-gray-600">
                Generate GSTR-1 and GSTR-2 reports automatically.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <div className="text-4xl mb-4">👥</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Multi-User Support</h4>
              <p className="text-gray-600">
                Collaborate with team members with role-based access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h3 className="text-4xl font-bold mb-6">
            Ready to Simplify Your Invoicing?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of Indian businesses using InvoiceHub for GST compliance.
          </p>
          <Link href="/register" className="inline-block px-8 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 font-semibold text-lg">
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h5 className="text-white font-bold mb-4">InvoiceHub</h5>
              <p className="text-sm">GST Invoice Management for Indian Businesses</p>
            </div>
            <div>
              <h5 className="text-white font-bold mb-4">Product</h5>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-4">Company</h5>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-4">Legal</h5>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 InvoiceHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
