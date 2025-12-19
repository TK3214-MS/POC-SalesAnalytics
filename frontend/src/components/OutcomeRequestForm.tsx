'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/baseui/Button';
import { Select } from '@/components/baseui/Select';
import { apiClient } from '@/app/api-proxy';

interface OutcomeRequestFormProps {
  sessionId: string;
}

export function OutcomeRequestForm({ sessionId }: OutcomeRequestFormProps) {
  const [outcome, setOutcome] = useState<'won' | 'lost' | 'pending' | 'canceled'>('pending');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await apiClient.post('/CreateOutcomeLabelRequest', {
        sessionId,
        outcome,
        reason: reason || null,
      });
      alert('Outcome 申請を送信しました');
      window.location.reload();
    } catch (error) {
      console.error('Failed to submit request:', error);
      alert('申請に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlassCard>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <h2 className="text-2xl font-semibold">Outcome 申請</h2>

        <div>
          <label className="block text-sm font-medium mb-2">結果</label>
          <Select
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as typeof outcome)}
            options={[
              { value: 'won', label: '成約（Won）' },
              { value: 'lost', label: '失注（Lost）' },
              { value: 'pending', label: '保留（Pending）' },
              { value: 'canceled', label: '中止（Canceled）' },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            理由（任意）
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            placeholder="申請理由を入力（期限超過時は必須）"
          />
        </div>

        <Button type="submit" variant="primary" disabled={submitting} className="w-full">
          {submitting ? '送信中...' : '申請する'}
        </Button>
      </form>
    </GlassCard>
  );
}
