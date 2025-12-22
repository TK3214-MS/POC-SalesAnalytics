'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: '音声解析', href: '/upload', icon: '/assets/logo/Voice.png' },
  { name: '商談一覧', href: '/sessions', icon: '/assets/logo/case.png' },
  { name: '承認キュー', href: '/approvals', icon: '/assets/logo/Approval.png' },
  { name: 'KPIダッシュボード', href: '/kpi', icon: '/assets/logo/KPI.png' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/assets/logo/Top.png" alt="Logo" width={32} height={32} className="object-contain" />
          <div>
            <h1 className="text-xl font-bold text-black">Sales Analytics</h1>
            <p className="text-xs text-gray-500">商談分析システム</p>
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
                  ? 'bg-black text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <Image 
                src={item.icon} 
                alt={item.name} 
                width={24} 
                height={24} 
                className={`object-contain ${isActive ? 'brightness-0 invert' : ''}`}
              />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50">
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-sm font-bold text-white">
            D
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-black truncate">Demo User</p>
            <p className="text-xs text-gray-500 truncate">demo@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
