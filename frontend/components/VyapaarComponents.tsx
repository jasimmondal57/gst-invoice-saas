// Vyapaar UI Component Library
import React from 'react';

// Page Header Component
export const PageHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div className="mb-6 flex justify-between items-start">
    <div>
      <h1 className="text-3xl font-bold" style={{ color: 'var(--text-dark)' }}>{title}</h1>
      {subtitle && <p className="text-sm mt-1" style={{ color: 'var(--text-gray)' }}>{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// Primary Button
export const PrimaryButton = ({ children, onClick, disabled = false, className = '' }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-2 rounded-lg text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50 ${className}`}
    style={{ backgroundColor: 'var(--primary)' }}
  >
    {children}
  </button>
);

// Secondary Button
export const SecondaryButton = ({ children, onClick, className = '' }: any) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-lg text-sm font-medium transition border ${className}`}
    style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
  >
    {children}
  </button>
);

// Card Component
export const Card = ({ children, className = '' }: any) => (
  <div className={`rounded-lg border p-6 ${className}`} style={{ backgroundColor: 'var(--white)', borderColor: 'var(--border-gray)' }}>
    {children}
  </div>
);

// Card Header
export const CardHeader = ({ title, subtitle, action }: any) => (
  <div className="flex justify-between items-start mb-4 pb-4 border-b" style={{ borderColor: 'var(--border-gray)' }}>
    <div>
      <h2 className="text-lg font-bold" style={{ color: 'var(--text-dark)' }}>{title}</h2>
      {subtitle && <p className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// Form Input
export const FormInput = ({ label, placeholder, type = 'text', value, onChange, error, required = false }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>
      {label} {required && <span style={{ color: 'var(--error)' }}>*</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
      style={{
        borderColor: error ? 'var(--error)' : 'var(--border-gray)',
        focusRing: 'var(--primary)',
        color: 'var(--text-dark)',
      }}
    />
    {error && <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{error}</p>}
  </div>
);

// Form Select
export const FormSelect = ({ label, options, value, onChange, error, required = false }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>
      {label} {required && <span style={{ color: 'var(--error)' }}>*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
      style={{
        borderColor: error ? 'var(--error)' : 'var(--border-gray)',
        color: 'var(--text-dark)',
        backgroundColor: 'var(--white)',
      }}
    >
      <option value="" style={{ color: 'var(--text-gray)' }}>Select {label}</option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value} style={{ color: 'var(--text-dark)' }}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>{error}</p>}
  </div>
);

// Status Badge
export const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
      case 'COMPLETED':
      case 'ACTIVE':
        return { bg: 'rgba(76, 175, 80, 0.1)', text: 'var(--success)' };
      case 'PENDING':
      case 'DRAFT':
        return { bg: 'rgba(255, 152, 0, 0.1)', text: 'var(--warning)' };
      case 'OVERDUE':
      case 'FAILED':
      case 'CANCELLED':
        return { bg: 'rgba(244, 67, 54, 0.1)', text: 'var(--error)' };
      default:
        return { bg: 'rgba(153, 153, 153, 0.1)', text: 'var(--text-light)' };
    }
  };
  const style = getStatusStyle(status);
  // Display DRAFT as UNPAID for better UX
  const displayStatus = status.toUpperCase() === 'DRAFT' ? 'UNPAID' : status;
  return (
    <span className="text-xs px-3 py-1 rounded-full inline-block" style={{ backgroundColor: style.bg, color: style.text }}>
      {displayStatus}
    </span>
  );
};

// Table Component
export const Table = ({ columns, data, actions }: any) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr style={{ backgroundColor: 'var(--light-gray)', borderBottom: '1px solid var(--border-gray)' }}>
          {columns.map((col: any) => (
            <th key={col.key} className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>
              {col.label}
            </th>
          ))}
          {actions && <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((row: any, idx: number) => (
          <tr key={idx} className="border-b hover:bg-gray-50" style={{ borderColor: 'var(--border-gray)' }}>
            {columns.map((col: any) => (
              <td key={col.key} className="px-4 py-3 text-sm" style={{ color: 'var(--text-dark)' }}>
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </td>
            ))}
            {actions && (
              <td className="px-4 py-3 text-sm">
                <div className="flex gap-2">
                  {actions(row)}
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Metric Card
export const MetricCard = ({ icon, title, value, trend, trendColor = 'var(--success)' }: any) => (
  <Card>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-light)' }}>{title}</p>
        <p className="text-3xl font-bold mt-2" style={{ color: 'var(--text-dark)' }}>{value}</p>
        {trend && <p className="text-xs mt-2" style={{ color: trendColor }}>{trend}</p>}
      </div>
      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: 'rgba(237, 26, 59, 0.1)' }}>
        {icon}
      </div>
    </div>
  </Card>
);

// Alert Component
export const Alert = ({ type = 'info', message }: any) => {
  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'success':
        return { bg: 'rgba(76, 175, 80, 0.1)', text: 'var(--success)', border: 'var(--success)' };
      case 'error':
        return { bg: 'rgba(244, 67, 54, 0.1)', text: 'var(--error)', border: 'var(--error)' };
      case 'warning':
        return { bg: 'rgba(255, 152, 0, 0.1)', text: 'var(--warning)', border: 'var(--warning)' };
      default:
        return { bg: 'rgba(33, 150, 243, 0.1)', text: 'var(--info)', border: 'var(--info)' };
    }
  };
  const style = getAlertStyle(type);
  return (
    <div className="p-4 rounded-lg border mb-4" style={{ backgroundColor: style.bg, borderColor: style.border, color: style.text }}>
      {message}
    </div>
  );
};

// Modal Component
export const Modal = ({ isOpen, title, children, onClose, actions }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4 pb-4 border-b" style={{ borderColor: 'var(--border-gray)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-dark)' }}>{title}</h2>
          <button onClick={onClose} className="text-lg font-bold" style={{ color: 'var(--text-gray)', cursor: 'pointer' }}>✕</button>
        </div>
        <div className="mb-4">{children}</div>
        <div className="flex gap-2 justify-end">
          {actions}
        </div>
      </Card>
    </div>
  );
};

// Empty State
export const EmptyState = ({ icon, title, description, action }: any) => (
  <Card className="text-center py-12">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-dark)' }}>{title}</h3>
    <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>{description}</p>
    {action && <div>{action}</div>}
  </Card>
);

