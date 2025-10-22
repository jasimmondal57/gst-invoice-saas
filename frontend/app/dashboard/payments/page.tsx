'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, SecondaryButton, FormInput, FormSelect, Card, CardHeader, StatusBadge, Alert } from '@/components/VyapaarComponents';

interface Payment {
  id: string;
  invoiceId?: string;
  purchaseId?: string;
  customerId?: string;
  supplierId?: string;
  amount: number;
  paymentDate: string;
  paymentMode: string;
  referenceNo?: string;
  notes?: string;
  status: string;
}

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [summary, setSummary] = useState({ totalReceived: 0, totalPaid: 0 });
  const [formData, setFormData] = useState({
    invoiceId: '',
    purchaseId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'BANK_TRANSFER',
    referenceNo: '',
    notes: '',
  });

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      router.push('/login');
      return;
    }
    setToken(authToken);
    fetchPayments(authToken);
  }, [router]);

  const fetchPayments = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/payments', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
        calculateSummary(data);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (paymentList: Payment[]) => {
    const received = paymentList.filter(p => p.status === 'RECEIVED').reduce((sum, p) => sum + p.amount, 0);
    const paid = paymentList.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
    setSummary({ totalReceived: received, totalPaid: paid });
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!formData.amount) newErrors.amount = 'Amount is required';
    if (!formData.paymentDate) newErrors.paymentDate = 'Payment date is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount) }),
      });

      if (response.ok) {
        setSuccess('Payment recorded successfully!');
        setFormData({ invoiceId: '', purchaseId: '', amount: '', paymentDate: new Date().toISOString().split('T')[0], paymentMode: 'BANK_TRANSFER', referenceNo: '', notes: '' });
        setShowForm(false);
        fetchPayments(token);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Failed to record payment:', error);
    }
  };

  const filteredPayments = filterStatus === 'ALL' ? payments : payments.filter(p => p.status === filterStatus);

  return (
    <VyapaarPage
      title="Payments"
      subtitle="Track and manage all payments"
      loading={loading}
      action={
        <PrimaryButton onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Record Payment'}
        </PrimaryButton>
      }
      filters={
        <div className="flex gap-2">
          {['ALL', 'PAID', 'RECEIVED', 'PENDING'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition"
              style={{
                backgroundColor: filterStatus === status ? 'var(--primary)' : 'var(--white)',
                color: filterStatus === status ? 'white' : 'var(--text-gray)',
                borderColor: filterStatus === status ? 'var(--primary)' : 'var(--border-gray)',
                border: '1px solid',
              }}
            >
              {status}
            </button>
          ))}
        </div>
      }
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Total Received</p>
            <p className="text-2xl font-bold mt-2" style={{ color: 'var(--success)' }}>₹{summary.totalReceived.toLocaleString('en-IN')}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm" style={{ color: 'var(--text-gray)' }}>Total Paid</p>
            <p className="text-2xl font-bold mt-2" style={{ color: 'var(--primary)' }}>₹{summary.totalPaid.toLocaleString('en-IN')}</p>
          </div>
        </Card>
      </div>

      {/* Record Payment Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader title="Record Payment" subtitle="Enter payment details" />
          {success && <Alert type="success" message={`✓ ${success}`} />}
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Amount"
                placeholder="0.00"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                error={errors.amount}
                required
              />
              <FormInput
                label="Payment Date"
                type="date"
                value={formData.paymentDate}
                onChange={handleInputChange}
                error={errors.paymentDate}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="Payment Mode"
                options={[
                  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                  { value: 'CASH', label: 'Cash' },
                  { value: 'CHEQUE', label: 'Cheque' },
                  { value: 'CREDIT_CARD', label: 'Credit Card' },
                  { value: 'UPI', label: 'UPI' },
                ]}
                value={formData.paymentMode}
                onChange={handleInputChange}
              />
              <FormInput label="Reference No" placeholder="Cheque/Transaction ID" value={formData.referenceNo} onChange={handleInputChange} />
            </div>

            <FormInput label="Notes" placeholder="Payment notes" value={formData.notes} onChange={handleInputChange} />

            <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-gray)' }}>
              <PrimaryButton onClick={handleSubmit}>Record Payment</PrimaryButton>
              <SecondaryButton onClick={() => setShowForm(false)}>Cancel</SecondaryButton>
            </div>
          </form>
        </Card>
      )}

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-4">💳</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-dark)' }}>No payments yet</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>Record your first payment to get started</p>
          <PrimaryButton onClick={() => setShowForm(true)}>Record Payment</PrimaryButton>
        </Card>
      ) : (
        <Card>
          <CardHeader title={`Payments (${filteredPayments.length})`} subtitle="All recorded payments" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--light-gray)', borderBottom: '1px solid var(--border-gray)' }}>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Mode</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Reference</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50" style={{ borderColor: 'var(--border-gray)' }}>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-dark)' }}>{new Date(payment.paymentDate).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>₹{payment.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{payment.paymentMode.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-gray)' }}>{payment.referenceNo || '-'}</td>
                    <td className="px-4 py-3 text-sm"><StatusBadge status={payment.status} /></td>
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
