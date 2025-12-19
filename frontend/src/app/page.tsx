import Link from 'next/link';
import { GlassCard } from '@/components/glass/GlassCard';

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Sales Analytics
          </h1>
          <p className="text-xl text-gray-300">
            商談音声を分析し、成約率向上を支援
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard hover>
            <Link href="/upload" className="block p-8 space-y-4">
              <div className="text-4xl">🎤</div>
              <h2 className="text-2xl font-semibold">音声アップロード</h2>
              <p className="text-gray-300">
                商談音声をアップロードして自動分析を開始
              </p>
            </Link>
          </GlassCard>

          <GlassCard hover>
            <Link href="/sessions" className="block p-8 space-y-4">
              <div className="text-4xl">📊</div>
              <h2 className="text-2xl font-semibold">商談一覧</h2>
              <p className="text-gray-300">
                過去の商談データを閲覧・検索
              </p>
            </Link>
          </GlassCard>

          <GlassCard hover>
            <Link href="/approvals" className="block p-8 space-y-4">
              <div className="text-4xl">✅</div>
              <h2 className="text-2xl font-semibold">承認キュー</h2>
              <p className="text-gray-300">
                Outcome ラベルの承認待ち一覧
              </p>
            </Link>
          </GlassCard>

          <GlassCard hover>
            <Link href="/kpi" className="block p-8 space-y-4">
              <div className="text-4xl">📈</div>
              <h2 className="text-2xl font-semibold">KPI ダッシュボード</h2>
              <p className="text-gray-300">
                成約率・店舗別パフォーマンスを可視化
              </p>
            </Link>
          </GlassCard>
        </div>

        <footer className="text-center text-sm text-gray-400 pt-8">
          <p>© 2025 Sales Analytics. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
