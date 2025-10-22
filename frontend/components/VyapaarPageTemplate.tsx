// Vyapaar Page Template - Reusable layout for all pages
import React from 'react';

interface VyapaarPageProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  filters?: React.ReactNode;
  children: React.ReactNode;
  loading?: boolean;
}

export const VyapaarPage = ({
  title,
  subtitle,
  action,
  filters,
  children,
  loading = false,
}: VyapaarPageProps) => {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--light-gray)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--primary)' }}></div>
          <p style={{ color: 'var(--text-gray)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--light-gray)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-dark)' }}>{title}</h1>
            {subtitle && <p className="text-sm mt-1" style={{ color: 'var(--text-gray)' }}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>

        {/* Filters */}
        {filters && <div className="mb-6">{filters}</div>}

        {/* Content */}
        {children}
      </div>
    </div>
  );
};

// Vyapaar Form Template
interface VyapaarFormProps {
  title: string;
  subtitle?: string;
  onSubmit: (data: any) => void;
  children: React.ReactNode;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  loading?: boolean;
}

export const VyapaarForm = ({
  title,
  subtitle,
  onSubmit,
  children,
  submitText = 'Save',
  cancelText = 'Cancel',
  onCancel,
  loading = false,
}: VyapaarFormProps) => {
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--light-gray)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="rounded-lg border p-8" style={{ backgroundColor: 'var(--white)', borderColor: 'var(--border-gray)' }}>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-dark)' }}>{title}</h1>
          {subtitle && <p className="text-sm mb-6" style={{ color: 'var(--text-gray)' }}>{subtitle}</p>}

          <form onSubmit={onSubmit} className="space-y-4">
            {children}

            <div className="flex gap-3 pt-6 border-t" style={{ borderColor: 'var(--border-gray)' }}>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-lg text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {loading ? 'Saving...' : submitText}
              </button>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-2 rounded-lg text-sm font-medium transition border"
                  style={{ borderColor: 'var(--border-gray)', color: 'var(--text-gray)' }}
                >
                  {cancelText}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Vyapaar List Template
interface VyapaarListProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  columns: Array<{ key: string; label: string; render?: (value: any, row: any) => React.ReactNode }>;
  data: any[];
  actions?: (row: any) => React.ReactNode;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}

export const VyapaarList = ({
  title,
  subtitle,
  action,
  columns,
  data,
  actions,
  emptyIcon = '📋',
  emptyTitle = 'No data yet',
  emptyDescription = 'Get started by creating your first item',
  emptyAction,
}: VyapaarListProps) => {
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--light-gray)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-dark)' }}>{title}</h1>
            {subtitle && <p className="text-sm mt-1" style={{ color: 'var(--text-gray)' }}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>

        {/* Content */}
        {data.length === 0 ? (
          <div className="rounded-lg border p-12 text-center" style={{ backgroundColor: 'var(--white)', borderColor: 'var(--border-gray)' }}>
            <div className="text-6xl mb-4">{emptyIcon}</div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-dark)' }}>{emptyTitle}</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-gray)' }}>{emptyDescription}</p>
            {emptyAction && <div>{emptyAction}</div>}
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'var(--white)', borderColor: 'var(--border-gray)' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: 'var(--light-gray)', borderBottom: '1px solid var(--border-gray)' }}>
                    {columns.map((col) => (
                      <th key={col.key} className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>
                        {col.label}
                      </th>
                    ))}
                    {actions && <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50" style={{ borderColor: 'var(--border-gray)' }}>
                      {columns.map((col) => (
                        <td key={col.key} className="px-4 py-3 text-sm" style={{ color: 'var(--text-dark)' }}>
                          {col.render ? col.render(row[col.key], row) : row[col.key]}
                        </td>
                      ))}
                      {actions && (
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">{actions(row)}</div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

