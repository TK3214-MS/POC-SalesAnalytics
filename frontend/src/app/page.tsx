'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/glass/GlassCard';
import { apiClient } from '@/app/api-proxy';

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
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold">ダッシュボード</h1>
          <p className="text-gray-300">
            商談音声を分析し、成約率向上を支援
          </p>
        </header>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard>
            <Link href="/sessions" className="block p-6 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-3xl">📊</div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{loading ? '...' : stats.totalSessions}</p>
                  <p className="text-sm text-gray-400">総商談数</p>
                </div>
              </div>
            </Link>
          </GlassCard>

          <GlassCard>
            <Link href="/approvals" className="block p-6 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-3xl">✓</div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-warning">{loading ? '...' : stats.pendingApprovals}</p>
                  <p className="text-sm text-gray-400">承認待ち</p>
                </div>
              </div>
            </Link>
          </GlassCard>

          <GlassCard>
            <Link href="/kpi" className="block p-6 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-3xl">📈</div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-success">{loading ? '...' : `${stats.winRate}%`}</p>
                  <p className="text-sm text-gray-400">成約率</p>
                </div>
              </div>
            </Link>
          </GlassCard>
        </div>

        {/* クイックアクション */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard hover>
            <Link href="/upload" className="block p-8 space-y-4">
              <div className="text-4xl">🎤</div>
              <h2 className="text-2xl font-semibold">音声解析</h2>
              <p className="text-gray-300">
                商談音声をアップロードして自動分析を開始
              </p>
            </Link>
          </GlassCard>

          <GlassCard>
            <div className="p-8 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">最近の商談</h2>
                <Link href="/sessions" className="text-primary-400 hover:text-primary-300 text-sm">
                  すべて表示 →
                </Link>
              </div>
              <div className="space-y-3">
                {loading ? (
                  <p className="text-gray-400 text-sm">読み込み中...</p>
                ) : stats.recentSessions.length === 0 ? (
                  <p className="text-gray-400 text-sm">商談データがありません</p>
                ) : (
                  stats.recentSessions.map((session) => (
                    <Link
                      key={session.id}
                      href={`/sessions/${session.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{session.customerName}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(session.createdAt).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      {session.outcomeLabel && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          session.outcomeLabel === 'won' 
                            ? 'bg-success/20 text-success' 
                            : 'bg-danger/20 text-danger'
                        }`}>
                          {session.outcomeLabel === 'won' ? '成約' : '失注'}
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
              <h2 className="text-2xl font-semibold">今月の成約推移</h2>
              <Link href="/kpi" className="text-primary-400 hover:text-primary-300 text-sm">
                詳細を表示 →
              </Link>
            </div>
            <div className="h-48 flex items-end justify-between gap-2">
              {[65, 72, 58, 80, 75, 68, 82].map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all hover:from-primary-500 hover:to-primary-300"
                    style={{ height: `${value}%` }}
                  />
                  <span className="text-xs text-gray-400">{index + 1}週</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
