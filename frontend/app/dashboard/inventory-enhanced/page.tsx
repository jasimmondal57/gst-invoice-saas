'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { Card, CardHeader } from '@/components/VyapaarComponents';

export default function InventoryEnhancedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const features = [
    { title: 'Stock Movements', icon: '📊', description: 'Track all inventory movements' },
    { title: 'Batch Tracking', icon: '📦', description: 'Manage product batches' },
    { title: 'Expiry Management', icon: '⏰', description: 'Track expiry dates' },
    { title: 'Warehouse Management', icon: '🏭', description: 'Multi-warehouse support' },
    { title: 'Stock Adjustments', icon: '⚙️', description: 'Adjust stock levels' },
    { title: 'Inventory Reports', icon: '📈', description: 'Detailed inventory analytics' },
  ];

  return (
    <VyapaarPage
      title="Enhanced Inventory"
      subtitle="Advanced inventory management features"
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
