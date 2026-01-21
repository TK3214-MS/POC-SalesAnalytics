import { generateMockSessions, generateKpiData, generateApprovalQueue, type MockSession } from '@/lib/mock-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7071/api';

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

// デモモード用のグローバルストレージ
let mockSessionsCache: MockSession[] | null = null;

function getMockSessions(): MockSession[] {
  if (!mockSessionsCache) {
    mockSessionsCache = generateMockSessions(20);
  }
  return mockSessionsCache;
}

// デモモードチェック
function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('appMode') === 'demo';
}

async function request(endpoint: string, options: RequestOptions = {}) {
  const { method = 'GET', headers = {}, body } = options;

  // デモモードの場合、モック応答を返す
  if (isDemoMode()) {
    console.log(`[DEMO MODE] Mocking API call: ${method} ${endpoint}`);
    return getMockResponse(endpoint, method, body);
  }

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// モックレスポンス生成
function getMockResponse(endpoint: string, method: string, body?: unknown): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sessions = getMockSessions();
      
      if (endpoint === '/ListMySessions') {
        resolve({
          sessions: sessions.map(s => ({
            id: s.id,
            customerName: s.customerName,
            createdAt: s.createdAt,
            status: s.status,
            outcomeLabel: s.outcomeLabel,
          })),
        });
      } else if (endpoint.startsWith('/GetSession')) {
        const match = endpoint.match(/sessionId=([^&]+)/);
        const sessionId = match ? match[1] : 'demo-session-001';
        const session = sessions.find(s => s.id === sessionId) || sessions[0];
        resolve(session);
      } else if (endpoint === '/ListApprovalQueue') {
        const approvalQueue = generateApprovalQueue(sessions);
        resolve({ requests: approvalQueue });
      } else if (endpoint === '/GetKpi') {
        const kpiData = generateKpiData(sessions);
        resolve({ stores: kpiData });
      } else if (endpoint.startsWith('/ApproveOutcomeLabel')) {
        const match = endpoint.match(/requestId=([^&]+)/);
        const requestId = match ? match[1] : '';
        const session = sessions.find(s => s.outcomeLabelRequest?.id === requestId);
        if (session && session.outcomeLabelRequest) {
          session.outcomeLabel = session.outcomeLabelRequest.outcome;
          session.outcomeLabelRequest.approvalStatus = 'approved';
        }
        resolve({ success: true, message: 'Outcome label approved (Demo Mode)' });
      } else if (endpoint.startsWith('/RejectOutcomeLabel')) {
        const match = endpoint.match(/requestId=([^&]+)/);
        const requestId = match ? match[1] : '';
        const session = sessions.find(s => s.outcomeLabelRequest?.id === requestId);
        if (session && session.outcomeLabelRequest) {
          session.outcomeLabelRequest.approvalStatus = 'rejected';
        }
        resolve({ success: true, message: 'Outcome label rejected (Demo Mode)' });
      } else if (endpoint === '/UploadAudio') {
        if (body && typeof body === 'object' && 'text' in body) {
          const textBody = body as { text: string; consentGiven: string };
          const text = textBody.text;
          const newSessionId = `demo-session-text-${Date.now()}`;
          
          // テキストから会話を解析
          const lines = text.split('\n').filter(line => line.trim());
          const salesLines: string[] = [];
          const customerLines: string[] = [];
          
          lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('営業:') || trimmed.startsWith('営業：')) {
              salesLines.push(trimmed.substring(3).trim());
            } else if (trimmed.startsWith('顧客:') || trimmed.startsWith('顧客：')) {
              customerLines.push(trimmed.substring(3).trim());
            }
          });
          
          // 話者ごとのセグメントを生成
          const speakers: { id: string; segments: Array<{ id: string; text: string; start: number; end: number }> } = [] as any;
          let currentTime = 0;
          
          const salesSpeaker = {
            id: 'spk-0',
            segments: salesLines.map((text, idx) => {
              const duration = Math.min(text.length / 10, 30); // テキスト長に応じた時間
              const segment = {
                id: `seg-0-${idx}`,
                text,
                start: currentTime,
                end: currentTime + duration,
              };
              currentTime += duration + 2; // 2秒の間隔
              return segment;
            }),
          };
          
          const customerSpeaker = {
            id: 'spk-1',
            segments: customerLines.map((text, idx) => {
              const duration = Math.min(text.length / 10, 30);
              const segment = {
                id: `seg-1-${idx}`,
                text,
                start: currentTime,
                end: currentTime + duration,
              };
              currentTime += duration + 2;
              return segment;
            }),
          };
          
          speakers.push(salesSpeaker, customerSpeaker);
          
          // テキスト内容から要約とキーポイントを抽出
          const fullText = text.toLowerCase();
          let customerName = '新規顧客';
          let vehicleType = 'SUV';
          let outcome: 'won' | 'lost' | 'pending' | null = null;
          
          // 車種の判定
          if (fullText.includes('セダン')) vehicleType = 'セダン';
          else if (fullText.includes('コンパクト')) vehicleType = 'コンパクトカー';
          else if (fullText.includes('ミニバン')) vehicleType = 'ミニバン';
          
          // 成約状況の判定
          if (fullText.includes('契約') || fullText.includes('購入') || fullText.includes('ご契約')) {
            outcome = 'won';
          } else if (fullText.includes('他のディーラー') || fullText.includes('検討します') || fullText.includes('また来ます')) {
            outcome = 'lost';
          }
          
          // キーポイントと要約の抽出
          const keyPoints: string[] = [];
          const concerns: string[] = [];
          const successFactors: string[] = [];
          const improvementAreas: string[] = [];
          const quotations: Array<{ text: string; speaker: string }> = [];
          
          // キーポイント
          if (fullText.includes('安全')) keyPoints.push(`${vehicleType}の安全性能に関心`);
          if (fullText.includes('燃費')) keyPoints.push('燃費性能を重視');
          if (fullText.includes('家族') || fullText.includes('子供')) keyPoints.push('家族での利用を想定');
          if (fullText.includes('試乗')) keyPoints.push('試乗を実施');
          if (fullText.includes('ハイブリッド')) keyPoints.push('ハイブリッドモデルを検討');
          if (keyPoints.length === 0) keyPoints.push(`${vehicleType}の購入を検討`);
          
          // 成功要因と改善点
          if (outcome === 'won') {
            successFactors.push('顧客ニーズの的確な把握', '詳細な商品説明と試乗体験', '適切な価格提案とキャンペーン案内');
          } else if (outcome === 'lost') {
            improvementAreas.push('より詳細な商品情報の提供', '顧客のニーズに対する深掘り', '競合との差別化ポイントの明確化');
            concerns.push('他社製品との比較検討中', '予算や条件面での懸念');
          } else {
            keyPoints.push('検討継続中');
          }
          
          // 重要な発言を引用として抽出（最初の顧客の発言）
          if (customerLines.length > 0) {
            quotations.push({
              text: customerLines[0],
              speaker: '顧客',
            });
          }
          
          // センチメント判定
          let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
          if (outcome === 'won') sentiment = 'positive';
          else if (outcome === 'lost') sentiment = 'negative';
          
          const newSession: MockSession = {
            id: newSessionId,
            customerName,
            createdAt: new Date().toISOString(),
            status: 'completed',
            storeId: '東京本店',
            salesPerson: '営業担当',
            transcription: {
              speakers,
            },
            sentiment: { overall: sentiment },
            summary: {
              keyPoints,
              concerns,
              nextActions: outcome === 'won' 
                ? ['納車準備', '保険手続きのサポート'] 
                : outcome === 'lost'
                ? ['フォローアップ連絡', '競合分析の実施']
                : ['再来店の促進', '追加資料の送付'],
              successFactors,
              improvementAreas,
              quotations,
            },
            outcomeLabel: null,
          };
          sessions.push(newSession);
          mockSessionsCache = sessions;
          resolve({ sessionId: newSessionId, message: 'Text upload successful (Demo Mode)' });
        } else {
          resolve({ sessionId: `demo-session-${Date.now()}`, message: 'Audio upload successful (Demo Mode)' });
        }
      } else if (endpoint === '/CreateOutcomeLabel') {
        const requestBody = body as { sessionId: string; outcome: string; reason: string };
        const session = sessions.find(s => s.id === requestBody.sessionId);
        if (session) {
          const newRequest = {
            id: `req-${Date.now()}`,
            outcome: requestBody.outcome as 'won' | 'lost' | 'pending' | 'canceled',
            reason: requestBody.reason,
            requestedBy: '現在のユーザー',
            requestedAt: new Date().toISOString(),
            approvalStatus: 'pending' as const,
            deadlineExceeded: false,
          };
          session.outcomeLabelRequest = newRequest;
        }
        resolve({ success: true, message: 'Outcome label request created (Demo Mode)' });
      } else {
        resolve({ message: 'Demo mode - operation simulated' });
      }
    }, 300);
  });
}

export const apiClient = {
  get: (endpoint: string) => request(endpoint),
  post: (endpoint: string, body: unknown) => request(endpoint, { method: 'POST', body }),
  put: (endpoint: string, body: unknown) => request(endpoint, { method: 'PUT', body }),
  delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
};
