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

export default function EnhancedInventoryPage() {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [suggestions, setSuggestions] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [optimization, setOptimization] = useState<any>(null);
  const [healthScore, setHealthScore] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const organizationId = localStorage.getItem('organizationId');

      // Fetch all data in parallel
      const [suggestionsRes, forecastRes, optimizationRes, healthRes] = await Promise.all([
        fetch('http://localhost:5000/api/v1/inventory-enhanced/reorder-suggestions', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({ organizationId }),
        }),
        fetch('http://localhost:5000/api/v1/inventory-enhanced/forecast', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({ organizationId }),
        }),
        fetch('http://localhost:5000/api/v1/inventory-enhanced/optimization', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({ organizationId }),
        }),
        fetch('http://localhost:5000/api/v1/inventory-enhanced/health-score', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({ organizationId }),
        }),
      ]);

      if (suggestionsRes.ok) setSuggestions(await suggestionsRes.json());
      if (forecastRes.ok) setForecast(await forecastRes.json());
      if (optimizationRes.ok) setOptimization(await optimizationRes.json());
      if (healthRes.ok) setHealthScore(await healthRes.json());
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      CRITICAL: 'bg-red-100 text-red-800',
      HIGH: 'bg-orange-100 text-orange-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      HEALTHY: 'bg-green-100 text-green-800',
      WARNING: 'bg-orange-100 text-orange-800',
      STOCKOUT: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRecommendationColor = (recommendation: string) => {
    const colors: { [key: string]: string } = {
      MAINTAIN: 'bg-green-100 text-green-800',
      URGENT_REORDER: 'bg-red-100 text-red-800',
      INCREASE_REORDER: 'bg-orange-100 text-orange-800',
      DECREASE_REORDER: 'bg-blue-100 text-blue-800',
      REDUCE_STOCK: 'bg-purple-100 text-purple-800',
    };
    return colors[recommendation] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Inventory Management</h1>
          <p className="text-gray-600 mt-2">AI-powered inventory optimization and forecasting</p>
        </div>

        {/* Health Score Summary */}
        {healthScore && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory Health Score</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">{healthScore.summary.avgScore}</div>
                <div className="text-gray-600 text-sm mt-2">{healthScore.summary.healthStatus}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{healthScore.summary.excellentItems}</div>
                <div className="text-gray-600 text-sm mt-2">Excellent</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{healthScore.summary.goodItems}</div>
                <div className="text-gray-600 text-sm mt-2">Good</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{healthScore.summary.fairItems}</div>
                <div className="text-gray-600 text-sm mt-2">Fair</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{healthScore.summary.poorItems}</div>
                <div className="text-gray-600 text-sm mt-2">Poor</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="flex border-b border-gray-200">
            {['suggestions', 'forecast', 'optimization', 'health'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading data...</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Reorder Suggestions */}
            {activeTab === 'suggestions' && suggestions && (
              <div>
                <div className="mb-6 grid grid-cols-3 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-red-600 font-semibold">{suggestions.summary.criticalItems}</div>
                    <div className="text-red-600 text-sm">Critical Items</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-orange-600 font-semibold">{suggestions.summary.highPriorityItems}</div>
                    <div className="text-orange-600 text-sm">High Priority</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-blue-600 font-semibold">₹{suggestions.summary.totalEstimatedCost.toLocaleString('en-IN')}</div>
                    <div className="text-blue-600 text-sm">Total Cost</div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold">Product</th>
                        <th className="px-4 py-2 text-left font-semibold">Current</th>
                        <th className="px-4 py-2 text-left font-semibold">Reorder Qty</th>
                        <th className="px-4 py-2 text-left font-semibold">Est. Cost</th>
                        <th className="px-4 py-2 text-left font-semibold">Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suggestions.suggestions.map((item: any, idx: number) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">{item.productName}</td>
                          <td className="px-4 py-2">{item.currentStock}</td>
                          <td className="px-4 py-2">{item.suggestedPOQuantity}</td>
                          <td className="px-4 py-2">₹{item.estimatedCost.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Forecast */}
            {activeTab === 'forecast' && forecast && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">Product</th>
                      <th className="px-4 py-2 text-left font-semibold">Current</th>
                      <th className="px-4 py-2 text-left font-semibold">Avg Daily Sales</th>
                      <th className="px-4 py-2 text-left font-semibold">Days Until Stockout</th>
                      <th className="px-4 py-2 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecast.forecast.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{item.productName}</td>
                        <td className="px-4 py-2">{item.currentStock}</td>
                        <td className="px-4 py-2">{item.avgDailySales}</td>
                        <td className="px-4 py-2 font-semibold">{item.daysUntilStockout}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(item.forecastStatus)}`}>
                            {item.forecastStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Optimization */}
            {activeTab === 'optimization' && optimization && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">Product</th>
                      <th className="px-4 py-2 text-left font-semibold">Recommendation</th>
                      <th className="px-4 py-2 text-left font-semibold">Reason</th>
                      <th className="px-4 py-2 text-left font-semibold">Suggested Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {optimization.recommendations.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{item.productName}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getRecommendationColor(item.recommendation)}`}>
                            {item.recommendation.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-600">{item.reason}</td>
                        <td className="px-4 py-2 font-semibold">{item.suggestedReorderQuantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

