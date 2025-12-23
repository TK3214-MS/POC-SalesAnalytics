'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/glass/GlassCard';
import { DeadlinePill } from '@/components/glass/DeadlinePill';
import { apiClient } from '@/app/api-proxy';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { PageHeader } from '@/components/PageHeader';

interface Session {
  id: string;
  customerName: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  outcomeLabel: 'won' | 'lost' | 'pending' | 'canceled' | null;
  deadlineDays: number;
}

export default function SessionsPage() {
  const { t } = useLanguage();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await apiClient.get('/ListMySessions');
        setSessions(data.sessions || []);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
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
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader 
          title={t.sessions.title}
          subtitle={t.sessions.subtitle}
          actions={
            <Link
              href="/upload"
              className="px-6 py-3 rounded-lg bg-black hover:bg-gray-800 text-white transition-colors"
            >
              + {t.nav.upload}
            </Link>
          }
        />

        <div className="space-y-4">
          {sessions.length === 0 ? (
            <GlassCard>
              <div className="p-8 text-center text-gray-600">
                {t.sessions.noSessions}
              </div>
            </GlassCard>
          ) : (
            sessions.map((session) => (
              <GlassCard key={session.id} hover>
                <Link
                  href={`/sessions/${session.id}`}
                  className="block p-6 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">
                      {session.customerName}
                    </h3>
                    <DeadlinePill days={session.deadlineDays} />
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{new Date(session.createdAt).toLocaleDateString('ja-JP')}</span>
                    <span className="capitalize">{session.status}</span>
                    {session.outcomeLabel && (
                      <span className="px-2 py-1 rounded bg-success/20 text-success">
                        {session.outcomeLabel}
                      </span>
                    )}
                  </div>
                </Link>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
