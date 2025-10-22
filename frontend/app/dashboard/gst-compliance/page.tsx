'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, Card, CardHeader } from '@/components/VyapaarComponents';

interface GSTReport {
  period: string;
  gstr1: { status: string; dueDate: string; filedDate?: string };
  gstr2: { status: string; dueDate: string; filedDate?: string };
  gstr3b: { status: string; dueDate: string; filedDate?: string };
  totalTaxCollected: number;
  totalTaxPaid: number;
}

export default function GSTCompliancePage() {
  const router = useRouter();
  const [reports, setReports] = useState<GSTReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      router.push('/login');
      return;
    }
    setToken(authToken);
    fetchGSTReports(authToken);
  }, [router]);

  const fetchGSTReports = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/gst-compliance', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data);
        if (data.length > 0) setSelectedPeriod(data[0].period);
      }
    } catch (error) {
      console.error('Failed to fetch GST reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedReport = reports.find(r => r.period === selectedPeriod);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FILED': return 'var(--success)';
      case 'PENDING': return 'var(--warning)';
      case 'OVERDUE': return 'var(--error)';
      default: return 'var(--text-gray)';
    }
  };

  return (
    <VyapaarPage
      title="GST Compliance"
      subtitle="Track GST filings and compliance status"
      loading={loading}
    >
      {/* Period Selection */}
      <Card className="mb-6">
        <div className="p-6">
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-dark)' }}>Select Period</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border"
            style={{ borderColor: 'var(--border-gray)' }}
          >
            {reports.map((report) => (
              <option key={report.period} value={report.period}>{report.period}</option>
            ))}
          </select>
        </div>
      </Card>

      {selectedReport && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card>
              <div className="p-6">
                <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Total Tax Collected</p>
                <p className="text-2xl font-bold mt-2" style={{ color: 'var(--success)' }}>₹{selectedReport.totalTaxCollected.toLocaleString('en-IN')}</p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Total Tax Paid</p>
                <p className="text-2xl font-bold mt-2" style={{ color: 'var(--primary)' }}>₹{selectedReport.totalTaxPaid.toLocaleString('en-IN')}</p>
              </div>
            </Card>
          </div>

          {/* GST Forms Status */}
          <Card>
            <CardHeader title="GST Forms Status" subtitle={`For period: ${selectedReport.period}`} />
            <div className="space-y-4 p-6">
              {/* GSTR-1 */}
              <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border-gray)' }}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold" style={{ color: 'var(--text-dark)' }}>GSTR-1 (Outward Supplies)</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: getStatusColor(selectedReport.gstr1.status) + '20', color: getStatusColor(selectedReport.gstr1.status) }}>
                    {selectedReport.gstr1.status}
                  </span>
                </div>
                <p className="text-sm mb-2" style={{ color: 'var(--text-gray)' }}>Due Date: {new Date(selectedReport.gstr1.dueDate).toLocaleDateString('en-IN')}</p>
                {selectedReport.gstr1.filedDate && (
                  <p className="text-sm" style={{ color: 'var(--success)' }}>Filed on: {new Date(selectedReport.gstr1.filedDate).toLocaleDateString('en-IN')}</p>
                )}
                <PrimaryButton className="mt-3">View Details</PrimaryButton>
              </div>

              {/* GSTR-2 */}
              <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border-gray)' }}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold" style={{ color: 'var(--text-dark)' }}>GSTR-2 (Inward Supplies)</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: getStatusColor(selectedReport.gstr2.status) + '20', color: getStatusColor(selectedReport.gstr2.status) }}>
                    {selectedReport.gstr2.status}
                  </span>
                </div>
                <p className="text-sm mb-2" style={{ color: 'var(--text-gray)' }}>Due Date: {new Date(selectedReport.gstr2.dueDate).toLocaleDateString('en-IN')}</p>
                {selectedReport.gstr2.filedDate && (
                  <p className="text-sm" style={{ color: 'var(--success)' }}>Filed on: {new Date(selectedReport.gstr2.filedDate).toLocaleDateString('en-IN')}</p>
                )}
                <PrimaryButton className="mt-3">View Details</PrimaryButton>
              </div>

              {/* GSTR-3B */}
              <div className="border rounded-lg p-4" style={{ borderColor: 'var(--border-gray)' }}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold" style={{ color: 'var(--text-dark)' }}>GSTR-3B (Monthly Return)</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: getStatusColor(selectedReport.gstr3b.status) + '20', color: getStatusColor(selectedReport.gstr3b.status) }}>
                    {selectedReport.gstr3b.status}
                  </span>
                </div>
                <p className="text-sm mb-2" style={{ color: 'var(--text-gray)' }}>Due Date: {new Date(selectedReport.gstr3b.dueDate).toLocaleDateString('en-IN')}</p>
                {selectedReport.gstr3b.filedDate && (
                  <p className="text-sm" style={{ color: 'var(--success)' }}>Filed on: {new Date(selectedReport.gstr3b.filedDate).toLocaleDateString('en-IN')}</p>
                )}
                <PrimaryButton className="mt-3">View Details</PrimaryButton>
              </div>
            </div>
          </Card>
        </>
      )}
    </VyapaarPage>
  );
}
