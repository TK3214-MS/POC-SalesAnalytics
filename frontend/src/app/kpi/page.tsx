'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/glass/GlassCard';
import { apiClient } from '@/app/api-proxy';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface KpiData {
  storeId: string;
  total: number;
  won: number;
  lost: number;
  pending: number;
  conversionRate: number;
}

export default function KpiPage() {
  const [kpiData, setKpiData] = useState<KpiData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKpi = async () => {
      try {
        const data = await apiClient.get('/GetKpi');
        setKpiData(data.stores || []);
      } catch (error) {
        console.error('Failed to fetch KPI:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKpi();
  }, []);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">読み込み中...</div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <h1 className="text-4xl font-bold">KPI ダッシュボード</h1>
          <p className="text-gray-300 mt-2">成約率・店舗別パフォーマンス</p>
        </header>

        <GlassCard>
          <div className="p-6 space-y-6">
            <h2 className="text-2xl font-semibold">店舗別成約率</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={kpiData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="storeId" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="won" fill="#10b981" name="成約" />
                <Bar dataKey="lost" fill="#ef4444" name="失注" />
                <Bar dataKey="pending" fill="#f59e0b" name="保留" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kpiData.map((store) => (
            <GlassCard key={store.storeId}>
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-semibold">{store.storeId}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">総数</span>
                    <span className="font-semibold">{store.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">成約</span>
                    <span className="text-success font-semibold">{store.won}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">失注</span>
                    <span className="text-danger font-semibold">{store.lost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">成約率</span>
                    <span className="text-primary-400 font-bold text-lg">
                      {store.conversionRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </main>
  );
}
