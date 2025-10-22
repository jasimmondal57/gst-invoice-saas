'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { PrimaryButton, Card, CardHeader } from '@/components/VyapaarComponents';

export default function ManufacturingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const features = [
    { title: 'Bill of Materials', icon: '📋', description: 'Create and manage BOMs' },
    { title: 'Production Orders', icon: '🏭', description: 'Track production orders' },
    { title: 'Work Orders', icon: '⚙️', description: 'Manage work orders' },
    { title: 'Quality Control', icon: '✓', description: 'Quality assurance tracking' },
    { title: 'Production Reports', icon: '📊', description: 'Production analytics' },
    { title: 'Cost Analysis', icon: '💰', description: 'Manufacturing cost analysis' },
  ];

  return (
    <VyapaarPage
      title="Manufacturing"
      subtitle="Manage manufacturing and production"
      loading={loading}
    >
      <div className="grid grid-cols-2 gap-4">
        {features.map((feature, idx) => (
          <Card key={idx} className="cursor-pointer hover:shadow-lg transition">
            <div className="p-6">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-dark)' }}>{feature.title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-gray)' }}>{feature.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </VyapaarPage>
  );
}
