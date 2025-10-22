'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, Card, CardHeader } from '@/components/VyapaarComponents';

interface ReportData {
  totalSales: number;
  totalPurchases: number;
  totalTax: number;
  totalPayments: number;
  pendingAmount: number;
}

export default function ReportsPage() {
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData>({
    totalSales: 0,
    totalPurchases: 0,
    totalTax: 0,
    totalPayments: 0,
    pendingAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [selectedReport, setSelectedReport] = useState('SALES');

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      router.push('/login');
      return;
    }
    setToken(authToken);
    fetchReportData(authToken);
  }, [router]);

  const fetchReportData = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/reports/summary', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const reports = [
    { id: 'SALES', label: 'Sales Report', icon: '📊', color: 'var(--success)' },
    { id: 'PURCHASES', label: 'Purchase Report', icon: '📦', color: 'var(--primary)' },
    { id: 'GST', label: 'GST Report', icon: '📋', color: 'var(--info)' },
    { id: 'PAYMENTS', label: 'Payment Report', icon: '💳', color: 'var(--warning)' },
  ];

  return (
    <VyapaarPage
      title="Reports"
      subtitle="View business analytics and reports"
      loading={loading}
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Total Sales</p>
            <p className="text-2xl font-bold mt-2" style={{ color: 'var(--success)' }}>₹{reportData.totalSales.toLocaleString('en-IN')}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Total Purchases</p>
            <p className="text-2xl font-bold mt-2" style={{ color: 'var(--primary)' }}>₹{reportData.totalPurchases.toLocaleString('en-IN')}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Total Tax</p>
            <p className="text-2xl font-bold mt-2" style={{ color: 'var(--info)' }}>₹{reportData.totalTax.toLocaleString('en-IN')}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Pending Amount</p>
            <p className="text-2xl font-bold mt-2" style={{ color: 'var(--warning)' }}>₹{reportData.pendingAmount.toLocaleString('en-IN')}</p>
          </div>
        </Card>
      </div>

      {/* Report Types */}
      <Card>
        <CardHeader title="Available Reports" subtitle="Select a report to view details" />
        <div className="grid grid-cols-2 gap-4 p-6">
          {reports.map((report) => (
            <div
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className="p-6 rounded-lg border-2 cursor-pointer transition hover:shadow-lg"
              style={{
                backgroundColor: selectedReport === report.id ? 'var(--light-gray)' : 'var(--white)',
                borderColor: selectedReport === report.id ? 'var(--primary)' : 'var(--border-gray)',
              }}
            >
              <div className="text-3xl mb-2">{report.icon}</div>
              <h3 className="font-semibold" style={{ color: 'var(--text-dark)' }}>{report.label}</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-gray)' }}>Click to view</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Report Details */}
      <Card className="mt-6">
        <CardHeader title={`${selectedReport} Report`} subtitle="Detailed report information" />
        <div className="p-6">
          {selectedReport === 'SALES' && (
            <div>
              <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>Total Sales Amount</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--success)' }}>₹{reportData.totalSales.toLocaleString('en-IN')}</p>
              <PrimaryButton className="mt-4" onClick={() => router.push('/dashboard/reports/sales')}>View Detailed Report</PrimaryButton>
            </div>
          )}
          {selectedReport === 'PURCHASES' && (
            <div>
              <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>Total Purchase Amount</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>₹{reportData.totalPurchases.toLocaleString('en-IN')}</p>
              <PrimaryButton className="mt-4" onClick={() => router.push('/dashboard/reports/purchase')}>View Detailed Report</PrimaryButton>
            </div>
          )}
          {selectedReport === 'GST' && (
            <div>
              <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>Total GST Collected</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--info)' }}>₹{reportData.totalTax.toLocaleString('en-IN')}</p>
              <PrimaryButton className="mt-4" onClick={() => router.push('/dashboard/gst-compliance')}>View GST Compliance</PrimaryButton>
            </div>
          )}
          {selectedReport === 'PAYMENTS' && (
            <div>
              <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>Total Payments Received</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--warning)' }}>₹{reportData.totalPayments.toLocaleString('en-IN')}</p>
              <PrimaryButton className="mt-4" onClick={() => router.push('/dashboard/payments')}>View Payment Details</PrimaryButton>
            </div>
          )}
        </div>
      </Card>
    </VyapaarPage>
  );
}

