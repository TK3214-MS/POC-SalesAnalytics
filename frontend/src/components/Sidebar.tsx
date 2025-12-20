'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: '音声解析', href: '/upload', icon: '🎤' },
  { name: '商談一覧', href: '/sessions', icon: '📋' },
  { name: '承認キュー', href: '/approvals', icon: '✓' },
  { name: 'KPIダッシュボード', href: '/kpi', icon: '📊' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 backdrop-blur-xl bg-slate-900/90 border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="text-3xl">🎯</div>
          <div>
            <h1 className="text-xl font-bold">Sales Analytics</h1>
            <p className="text-xs text-gray-400">商談分析システム</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isActive 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' 
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold">
            D
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Demo User</p>
            <p className="text-xs text-gray-400 truncate">demo@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
