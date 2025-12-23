import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Sidebar } from '@/components/Sidebar';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';

export const metadata: Metadata = {
  title: 'Sales Analytics - 商談音声分析',
  description: '自動車ディーラー向け商談音声分析システム',
  icons: {
    icon: [
      { url: '/assets/logo/Top.png' },
      { url: '/favicon.png', sizes: 'any' },
    ],
    apple: '/assets/logo/Top.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-black">
        <LanguageProvider>
          <div className="min-h-screen">
            <Sidebar />
            <main className="ml-64">
              {children}
            </main>
            <LanguageToggle />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
