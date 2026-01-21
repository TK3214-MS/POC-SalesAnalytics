'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/glass/GlassCard';
import { DeadlinePill } from '@/components/glass/DeadlinePill';
import { Button } from '@/components/baseui/Button';
import { SentimentBadge } from '@/components/SentimentBadge';
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
  // セッション詳細情報
  summary?: {
    keyPoints: string[];
    concerns: string[];
    quotations: Array<{ text: string; speaker: string }>;
  };
  sentiment?: {
    overall: 'positive' | 'neutral' | 'negative';
  };
  transcription?: {
    speakers: Array<{
      id: string;
      segments: Array<{ id: string; text: string; start: number; end: number }>;
    }>;
  };
}

interface ApprovalQueueProps {
  requests: ApprovalRequest[];
  onUpdate: () => void;
}

export function ApprovalQueue({ requests, onUpdate }: ApprovalQueueProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {requests.map((req) => {
        const isExpanded = expandedId === req.id;
        
        return (
          <GlassCard key={req.id}>
            <div className="p-6 space-y-4">
              {/* ヘッダー部分 */}
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-gray-900">{req.customerName}</h3>
                    {req.sentiment && <SentimentBadge sentiment={req.sentiment.overall} />}
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                    <p>申請者: <span className="font-medium text-gray-900">{req.requestedBy}</span></p>
                    <p>申請日: <span className="font-medium text-gray-900">{new Date(req.requestedAt).toLocaleDateString('ja-JP')}</span></p>
                    {req.reason && <p className="col-span-2">理由: <span className="font-medium text-gray-900">{req.reason}</span></p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      req.outcome === 'won'
                        ? 'bg-success/20 text-success'
                        : req.outcome === 'lost'
                        ? 'bg-danger/20 text-danger'
                        : 'bg-warning/20 text-warning'
                    }`}
                  >
                    {req.outcome === 'won' ? '成約' : req.outcome === 'lost' ? '失注' : '保留'}
                  </span>
                  {req.deadlineExceeded && (
                    <DeadlinePill days={-1} />
                  )}
                </div>
              </div>

              {/* 詳細展開ボタン */}
              <button
                onClick={() => toggleExpand(req.id)}
                className="w-full py-2 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center gap-2 border-t border-gray-200 pt-4"
              >
                {isExpanded ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    詳細を閉じる
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    詳細を表示
                  </>
                )}
              </button>

              {/* 展開可能な詳細セクション */}
              {isExpanded && (
                <div className="space-y-6 border-t border-gray-200 pt-6">
                  {/* AI要約 */}
                  {req.summary && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900">AI要約</h4>
                      
                      {req.summary.keyPoints.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-gray-700 mb-2">要点</h5>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {req.summary.keyPoints.map((point, idx) => (
                              <li key={idx}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {req.summary.concerns.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-gray-700 mb-2">懸念事項</h5>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            {req.summary.concerns.map((concern, idx) => (
                              <li key={idx}>{concern}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {req.summary.quotations.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-gray-700 mb-2">顧客の声</h5>
                          {req.summary.quotations.map((quote, idx) => (
                            <div key={idx} className="bg-primary-50 border-l-4 border-primary-500 p-3 rounded">
                              <p className="text-sm text-gray-900 italic">"{quote.text}"</p>
                              <p className="text-xs text-gray-600 mt-1">- {quote.speaker}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 文字起こしプレビュー */}
                  {req.transcription && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">文字起こし（抜粋）</h4>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                        {req.transcription.speakers.slice(0, 2).map((speaker, speakerIdx) => 
                          speaker.segments.slice(0, 3).map((segment, segmentIdx) => (
                            <div key={`${speakerIdx}-${segmentIdx}`} className="text-sm">
                              <span className="font-semibold text-primary-600">
                                {speaker.id === 'spk-0' ? '営業担当' : '顧客'}:
                              </span>{' '}
                              <span className="text-gray-700">{segment.text}</span>
                            </div>
                          ))
                        )}
                        <Link 
                          href={`/sessions/${req.sessionId}`}
                          className="block text-sm text-primary-600 hover:text-primary-700 font-medium mt-3"
                        >
                          全文を見る →
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* セッション詳細リンク */}
                  <Link 
                    href={`/sessions/${req.sessionId}`}
                    className="block w-full py-2 text-center text-sm text-primary-600 hover:text-primary-700 font-medium border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    セッション詳細を見る
                  </Link>
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="primary"
                  onClick={() => handleApprove(req.id)}
                  className="flex-1"
                >
                  ✓ 承認
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleReject(req.id)}
                  className="flex-1"
                >
                  ✗ 却下
                </Button>
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
