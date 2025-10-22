'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, Card, CardHeader } from '@/components/VyapaarComponents';

export default function AdvancedReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const reports = [
    { id: 'PROFIT_LOSS', title: 'Profit & Loss Statement', icon: '📊', description: 'Income and expense analysis' },
    { id: 'BALANCE_SHEET', title: 'Balance Sheet', icon: '📈', description: 'Assets, liabilities, and equity' },
    { id: 'CASH_FLOW', title: 'Cash Flow Statement', icon: '💰', description: 'Cash inflows and outflows' },
    { id: 'CUSTOMER_ANALYSIS', title: 'Customer Analysis', icon: '👥', description: 'Customer-wise sales and payments' },
    { id: 'PRODUCT_ANALYSIS', title: 'Product Analysis', icon: '📦', description: 'Product-wise sales performance' },
    { id: 'TAX_ANALYSIS', title: 'Tax Analysis', icon: '📋', description: 'Tax liability and compliance' },
  ];

  return (
    <VyapaarPage
      title="Advanced Reports"
      subtitle="Comprehensive business analytics and insights"
      loading={loading}
    >
      {/* Reports Grid */}
      <div className="grid grid-cols-2 gap-4">
        {reports.map((report) => (
          <Card
            key={report.id}
            className="cursor-pointer hover:shadow-lg transition"
            onClick={() => router.push(`/dashboard/advanced-reports/${report.id.toLowerCase()}`)}
          >
            <div className="p-6">
              <div className="text-4xl mb-3">{report.icon}</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>{report.title}</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>{report.description}</p>
              <PrimaryButton className="w-full">View Report</PrimaryButton>
            </div>
          </Card>
        ))}
      </div>

      {/* Export Options */}
      <Card className="mt-6">
        <CardHeader title="Export Reports" subtitle="Download reports in various formats" />
        <div className="p-6 space-y-3">
          <button className="w-full px-4 py-2 rounded-lg text-left font-medium transition" style={{ backgroundColor: 'var(--light-gray)', color: 'var(--text-dark)' }}>
            📄 Export as PDF
          </button>
          <button className="w-full px-4 py-2 rounded-lg text-left font-medium transition" style={{ backgroundColor: 'var(--light-gray)', color: 'var(--text-dark)' }}>
            📊 Export as Excel
          </button>
          <button className="w-full px-4 py-2 rounded-lg text-left font-medium transition" style={{ backgroundColor: 'var(--light-gray)', color: 'var(--text-dark)' }}>
            📋 Export as CSV
          </button>
        </div>
      </Card>
    </VyapaarPage>
  );
}
