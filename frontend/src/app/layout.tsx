import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Sidebar } from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Sales Analytics - 商談音声分析',
  description: '自動車ディーラー向け商談音声分析システム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="min-h-screen backdrop-blur-xs">
          <Sidebar />
          <main className="ml-64">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
