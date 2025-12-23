'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/glass/GlassCard';
import { apiClient } from '@/app/api-proxy';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { PageHeader } from '@/components/PageHeader';

interface KpiData {
  storeId: string;
  total: number;
  won: number;
  lost: number;
  pending: number;
  conversionRate: number;
}

export default function KpiPage() {
  const { t } = useLanguage();
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
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="text-center text-gray-600">{t.common.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-8">
        <PageHeader 
          title={t.kpi.title}
          subtitle={t.kpi.subtitle}
        />

        <GlassCard>
          <div className="p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-black">{t.kpi.storePerformance}</h2>
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
                <Bar dataKey="won" fill="#10b981" name={t.dashboard.won} />
                <Bar dataKey="lost" fill="#ef4444" name={t.dashboard.lost} />
                <Bar dataKey="pending" fill="#f59e0b" name={t.sessions.filterPending} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kpiData.map((store) => (
            <GlassCard key={store.storeId}>
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-semibold text-black">{store.storeId}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.kpi.sessionsLabel}</span>
                    <span className="font-semibold text-black">{store.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.dashboard.won}</span>
                    <span className="text-success font-semibold">{store.won}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.dashboard.lost}</span>
                    <span className="text-danger font-semibold">{store.lost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t.kpi.winRateLabel}</span>
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
    </div>
  );
}
