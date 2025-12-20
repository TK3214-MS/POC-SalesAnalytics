'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/glass/GlassCard';
import { ApprovalQueue } from '@/components/ApprovalQueue';
import { apiClient } from '@/app/api-proxy';

interface ApprovalRequest {
  id: string;
  sessionId: string;
  customerName: string;
  requestedBy: string;
  requestedAt: string;
  outcome: 'won' | 'lost' | 'pending' | 'canceled';
  reason: string | null;
  deadlineExceeded: boolean;
}

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await apiClient.get('/ListApprovalQueue');
        setRequests(data.requests || []);
      } catch (error) {
        console.error('Failed to fetch approval queue:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">読み込み中...</div>
      </main>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-4xl font-bold">承認キュー</h1>
          <p className="text-gray-300 mt-2">
            Outcome ラベルの承認待ち一覧（同一店舗のみ）
          </p>
        </header>

        {requests.length === 0 ? (
          <GlassCard>
            <div className="p-8 text-center text-gray-400">
              承認待ちのリクエストはありません
            </div>
          </GlassCard>
        ) : (
          <ApprovalQueue requests={requests} onUpdate={() => window.location.reload()} />
        )}
      </div>
    </div>
  );
}
