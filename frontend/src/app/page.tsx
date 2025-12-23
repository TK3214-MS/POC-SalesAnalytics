'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GlassCard } from '@/components/glass/GlassCard';
import { apiClient } from '@/app/api-proxy';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { PageHeader } from '@/components/PageHeader';

interface DashboardStats {
  totalSessions: number;
  pendingApprovals: number;
  winRate: number;
  recentSessions: Array<{
    id: string;
    customerName: string;
    createdAt: string;
    outcomeLabel: string | null;
  }>;
}

export default function HomePage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    totalSessions: 0,
    pendingApprovals: 0,
    winRate: 0,
    recentSessions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // TODO: 実際のAPIエンドポイントに置き換え
        // const data = await apiClient.get('/GetDashboardStats');
        // setStats(data);
        
        // デモデータ
        setStats({
          totalSessions: 127,
          pendingApprovals: 8,
          winRate: 68.5,
          recentSessions: [
            { id: '1', customerName: '田中様', createdAt: new Date().toISOString(), outcomeLabel: 'won' },
            { id: '2', customerName: '佐藤様', createdAt: new Date().toISOString(), outcomeLabel: null },
            { id: '3', customerName: '鈴木様', createdAt: new Date().toISOString(), outcomeLabel: 'lost' },
          ],
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        <PageHeader 
          title={t.dashboard.title}
          subtitle={t.dashboard.subtitle}
        />

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard>
            <Link href="/sessions" className="block p-6 space-y-2">
              <div className="flex items-center justify-between">
                <Image src="/assets/logo/case.png" alt="Sessions" width={48} height={48} className="object-contain" />
                <div className="text-right">
                  <p className="text-3xl font-bold text-black">{loading ? '...' : stats.totalSessions}</p>
                  <p className="text-sm text-gray-500">{t.dashboard.totalSessions}</p>
                </div>
              </div>
            </Link>
          </GlassCard>

          <GlassCard>
            <Link href="/approvals" className="block p-6 space-y-2">
              <div className="flex items-center justify-between">
                <Image src="/assets/logo/Approval.png" alt="Approvals" width={48} height={48} className="object-contain" />
                <div className="text-right">
                  <p className="text-3xl font-bold text-warning">{loading ? '...' : stats.pendingApprovals}</p>
                  <p className="text-sm text-gray-500">{t.dashboard.pendingApprovals}</p>
                </div>
              </div>
            </Link>
          </GlassCard>

          <GlassCard>
            <Link href="/kpi" className="block p-6 space-y-2">
              <div className="flex items-center justify-between">
                <Image src="/assets/logo/KPI.png" alt="KPI" width={48} height={48} className="object-contain" />
                <div className="text-right">
                  <p className="text-3xl font-bold text-success">{loading ? '...' : `${stats.winRate}%`}</p>
                  <p className="text-sm text-gray-500">{t.dashboard.winRate}</p>
                </div>
              </div>
            </Link>
          </GlassCard>
        </div>

        {/* クイックアクション */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard hover>
            <Link href="/upload" className="block p-8 space-y-4">
              <Image src="/assets/logo/Voice.png" alt="Upload" width={64} height={64} className="object-contain" />
              <h2 className="text-2xl font-semibold text-black">{t.dashboard.uploadTitle}</h2>
              <p className="text-gray-600">
                {t.dashboard.uploadDescription}
              </p>
            </Link>
          </GlassCard>

          <GlassCard>
            <div className="p-8 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-black">{t.dashboard.recentSessions}</h2>
                <Link href="/sessions" className="text-gray-600 hover:text-black text-sm">
                  {t.common.viewAll} →
                </Link>
              </div>
              <div className="space-y-3">
                {loading ? (
                  <p className="text-gray-500 text-sm">{t.common.loading}</p>
                ) : stats.recentSessions.length === 0 ? (
                  <p className="text-gray-500 text-sm">{t.sessions.noSessions}</p>
                ) : (
                  stats.recentSessions.map((session) => (
                    <Link
                      key={session.id}
                      href={`/sessions/${session.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-black">{session.customerName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(session.createdAt).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      {session.outcomeLabel && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          session.outcomeLabel === 'won' 
                            ? 'bg-success/20 text-success' 
                            : 'bg-danger/20 text-danger'
                        }`}>
                          {session.outcomeLabel === 'won' ? t.dashboard.won : t.dashboard.lost}
                        </span>
                      )}
                    </Link>
                  ))
                )}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* 簡易グラフプレビュー */}
        <GlassCard>
          <div className="p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-black">{t.dashboard.monthlyTrend}</h2>
              <Link href="/kpi" className="text-gray-600 hover:text-black text-sm">
                {t.common.showMore} →
              </Link>
            </div>
            <div className="h-48 flex items-end justify-between gap-2">
              {[65, 72, 58, 80, 75, 68, 82].map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-black to-gray-600 rounded-t-lg transition-all hover:from-gray-700 hover:to-gray-400"
                    style={{ height: `${value}%` }}
                  />
                  <span className="text-xs text-gray-500">{index + 1}{t.dashboard.week}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
