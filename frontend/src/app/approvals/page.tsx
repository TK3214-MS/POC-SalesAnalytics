'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/glass/GlassCard';
import { ApprovalQueue } from '@/components/ApprovalQueue';
import { apiClient } from '@/app/api-proxy';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { PageHeader } from '@/components/PageHeader';

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
  const { t } = useLanguage();
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
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="text-center text-gray-600">{t.common.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader 
          title={t.approvals.title}
          subtitle={t.approvals.subtitle}
        />

        {requests.length === 0 ? (
          <GlassCard>
            <div className="p-8 text-center text-gray-600">
              {t.approvals.noPending}
            </div>
          </GlassCard>
        ) : (
          <ApprovalQueue requests={requests} onUpdate={() => window.location.reload()} />
        )}
      </div>
    </div>
  );
}
