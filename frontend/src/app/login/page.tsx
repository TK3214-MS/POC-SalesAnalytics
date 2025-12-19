'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/baseui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Azure AD B2C / Entra ID 認証
    console.log('Login:', email, password);
  };

  return (
    <main className="container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
      <GlassCard className="w-full max-w-md">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">ログイン</h1>
            <p className="text-gray-400">Sales Analytics にアクセス</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                required
              />
            </div>

            <Button type="submit" variant="primary" className="w-full">
              ログイン
            </Button>
          </form>

          <div className="text-center text-sm text-gray-400">
            <p>Azure AD で認証</p>
          </div>
        </div>
      </GlassCard>
    </main>
  );
}
