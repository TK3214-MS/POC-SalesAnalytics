'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { GlassCard } from '@/components/glass/GlassCard';
import { SentimentBadge } from '@/components/SentimentBadge';
import { SpeakerTimeline } from '@/components/SpeakerTimeline';
import { OutcomeRequestForm } from '@/components/OutcomeRequestForm';
import { apiClient } from '@/app/api-proxy';

interface SessionDetail {
  id: string;
  customerName: string;
  createdAt: string;
  status: string;
  transcription: {
    speakers: Array<{
      id: string;
      segments: Array<{
        id: string;
        text: string;
        start: number;
        end: number;
      }>;
    }>;
  };
  sentiment: {
    overall: string;
  };
  summary: {
    keyPoints: string[];
    concerns: string[];
    nextActions: string[];
    successFactors: string[];
    improvementAreas: string[];
    quotations: Array<{
      speakerSegmentId: string;
      timeRange: string;
      text: string;
    }>;
  };
  outcomeLabel: string | null;
}

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await apiClient.get(`/GetSession?sessionId=${sessionId}`);
        setSession(data);
      } catch (error) {
        console.error('Failed to fetch session:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">読み込み中...</div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="container mx-auto px-4 py-16">
        <GlassCard>
          <div className="p-8 text-center">セッションが見つかりません</div>
        </GlassCard>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold">{session.customerName}</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">
              {new Date(session.createdAt).toLocaleDateString('ja-JP')}
            </span>
            <SentimentBadge sentiment={session.sentiment.overall} />
            {session.outcomeLabel && (
              <span className="px-3 py-1 rounded-full bg-success/20 text-success">
                {session.outcomeLabel}
              </span>
            )}
          </div>
        </header>

        {/* 文字起こし */}
        <GlassCard>
          <div className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-black">文字起こし</h2>
            <SpeakerTimeline speakers={session.transcription.speakers} />
          </div>
        </GlassCard>

        {/* 要約 */}
        <GlassCard>
          <div className="p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-black">AI 要約</h2>

            <div>
              <h3 className="text-lg font-semibold text-primary-600 mb-2">要点</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {session.summary.keyPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-warning mb-2">顧客懸念</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {session.summary.concerns.map((concern, i) => (
                  <li key={i}>{concern}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-success mb-2">次アクション</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {session.summary.nextActions.map((action, i) => (
                  <li key={i}>{action}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-primary-600 mb-2">引用</h3>
              <div className="space-y-2">
                {session.summary.quotations.map((quote, i) => (
                  <div key={i} className="p-3 rounded bg-primary-50 border border-primary-200">
                    <p className="text-sm text-gray-600 mb-1">{quote.timeRange}</p>
                    <p className="italic text-gray-800">"{quote.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Outcome 申請 */}
        {!session.outcomeLabel && (
          <OutcomeRequestForm sessionId={session.id} />
        )}
      </div>
    </main>
  );
}
