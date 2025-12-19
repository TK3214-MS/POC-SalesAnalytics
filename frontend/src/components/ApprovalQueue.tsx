'use client';

import { GlassCard } from '@/components/glass/GlassCard';
import { DeadlinePill } from '@/components/glass/DeadlinePill';
import { Button } from '@/components/baseui/Button';
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

interface ApprovalQueueProps {
  requests: ApprovalRequest[];
  onUpdate: () => void;
}

export function ApprovalQueue({ requests, onUpdate }: ApprovalQueueProps) {
  const handleApprove = async (requestId: string) => {
    try {
      await apiClient.post('/ApproveOutcomeLabelRequest', { requestId });
      alert('承認しました');
      onUpdate();
    } catch (error) {
      console.error('Failed to approve:', error);
      alert('承認に失敗しました');
    }
  };

  const handleReject = async (requestId: string) => {
    const reason = prompt('却下理由を入力してください');
    if (!reason) return;

    try {
      await apiClient.post('/RejectOutcomeLabelRequest', { requestId, reason });
      alert('却下しました');
      onUpdate();
    } catch (error) {
      console.error('Failed to reject:', error);
      alert('却下に失敗しました');
    }
  };

  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <GlassCard key={req.id}>
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{req.customerName}</h3>
                <div className="space-y-1 text-sm text-gray-400">
                  <p>申請者: {req.requestedBy}</p>
                  <p>申請日: {new Date(req.requestedAt).toLocaleDateString('ja-JP')}</p>
                  {req.reason && <p>理由: {req.reason}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    req.outcome === 'won'
                      ? 'bg-success/20 text-success'
                      : req.outcome === 'lost'
                      ? 'bg-danger/20 text-danger'
                      : 'bg-warning/20 text-warning'
                  }`}
                >
                  {req.outcome}
                </span>
                {req.deadlineExceeded && (
                  <DeadlinePill days={-1} />
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={() => handleApprove(req.id)}
                className="flex-1"
              >
                承認
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleReject(req.id)}
                className="flex-1"
              >
                却下
              </Button>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
