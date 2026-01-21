'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/baseui/Switch';

export type AppMode = 'demo' | 'production';

export function useDemoMode() {
  const [mode, setMode] = useState<AppMode>('demo');

  useEffect(() => {
    const savedMode = localStorage.getItem('appMode') as AppMode;
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  const toggleMode = (newMode: AppMode) => {
    setMode(newMode);
    localStorage.setItem('appMode', newMode);
  };

  return { mode, setMode: toggleMode, isDemoMode: mode === 'demo' };
}

export function DemoModeToggle() {
  const { mode, setMode } = useDemoMode();

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
      <span className="text-sm text-slate-300">
        {mode === 'demo' ? '🎭 デモモード' : '☁️ 本番モード'}
      </span>
      <Switch
        checked={mode === 'production'}
        onCheckedChange={(checked) => setMode(checked ? 'production' : 'demo')}
      />
    </div>
  );
}
