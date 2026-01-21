// デモモード用の大量MOCKデータ

export interface MockSession {
  id: string;
  customerName: string;
  createdAt: string;
  status: string;
  storeId: string;
  salesPerson: string;
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
    overall: 'positive' | 'neutral' | 'negative';
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
  outcomeLabel: 'won' | 'lost' | 'pending' | 'canceled' | null;
  outcomeLabelRequest?: {
    id: string;
    outcome: 'won' | 'lost' | 'pending' | 'canceled';
    reason: string | null;
    requestedBy: string;
    requestedAt: string;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    deadlineExceeded: boolean;
  };
}

// 顧客名のバリエーション
const customerNames = [
  '山田太郎', '佐藤花子', '田中一郎', '鈴木美咲', '高橋健太',
  '渡辺真理', '伊藤大輔', '中村優子', '小林誠', '加藤愛',
  '吉田拓也', '山本さくら', '佐々木亮', '松本恵', '井上浩二',
  '木村結衣', '林慎一', '斉藤麻衣', '清水洋介', '森川陽菜'
];

// 店舗ID
const storeIds = ['東京本店', '横浜支店', '千葉支店', '埼玉支店', '神奈川支店'];

// 営業担当者
const salesPersons = ['営業A', '営業B', '営業C', '営業D', '営業E'];

// リアルな商談会話テンプレート
const conversationTemplates = [
  {
    vehicle: 'SUV',
    budget: '400万円',
    family: '5人家族',
    purpose: '週末のレジャー',
    customerSegments: [
      { text: 'こんにちは。家族向けのSUVを探しているんです。', start: 7.0, end: 11.2 },
      { text: '5人家族で、週末によく遠出をします。', start: 17.0, end: 20.0 },
      { text: '予算は400万円くらいを考えています。', start: 27.0, end: 30.5 },
      { text: '安全性能はどうでしょうか？', start: 45.0, end: 47.5 },
      { text: '燃費も気になりますね。', start: 65.0, end: 67.2 },
      { text: '試乗できますか？', start: 85.0, end: 87.0 },
      { text: 'いいですね。次回、妻も連れてきます。', start: 105.0, end: 108.5 },
      { text: 'ありがとうございました。', start: 125.0, end: 127.0 },
    ],
    salesSegments: [
      { text: 'いらっしゃいませ。本日はご来店いただきありがとうございます。', start: 0, end: 3.5 },
      { text: 'どのようなお車をお探しでしょうか？', start: 3.8, end: 6.2 },
      { text: 'SUVですね。ご家族構成はどのような感じでしょうか？', start: 12.5, end: 16.8 },
      { text: '5人家族でしたら、こちらのモデルがおすすめです。3列シートで広々とした空間です。', start: 20.2, end: 26.5 },
      { text: 'ご予算に合わせて最適なプランをご提案いたします。', start: 31.0, end: 35.0 },
      { text: '最新の安全装備を標準搭載しております。自動ブレーキやレーンキープアシストなど。', start: 48.0, end: 55.0 },
      { text: 'ハイブリッドモデルなら燃費は20km/L以上です。', start: 68.0, end: 72.5 },
      { text: 'もちろんです。こちらで試乗のご予約を承ります。', start: 88.0, end: 92.0 },
      { text: 'ぜひご家族でお越しください。お待ちしております。', start: 109.0, end: 113.0 },
      { text: 'ありがとうございました。またのご来店をお待ちしております。', start: 128.0, end: 132.0 },
    ],
  },
  {
    vehicle: 'コンパクトカー',
    budget: '250万円',
    family: '夫婦2人',
    purpose: '通勤・買い物',
    customerSegments: [
      { text: '通勤用にコンパクトカーを探しています。', start: 5.0, end: 8.5 },
      { text: '予算は250万円くらいです。', start: 14.0, end: 16.8 },
      { text: '燃費が良くて維持費が安いのが希望です。', start: 25.0, end: 28.5 },
      { text: '駐車場が狭いので小回りが利く車がいいですね。', start: 42.0, end: 46.0 },
      { text: '検討してみます。', start: 65.0, end: 66.8 },
    ],
    salesSegments: [
      { text: 'いらっしゃいませ。お車をお探しですか？', start: 0, end: 3.2 },
      { text: 'コンパクトカーですね。用途は主に通勤でしょうか？', start: 9.0, end: 13.0 },
      { text: 'かしこまりました。こちらのモデルがおすすめです。', start: 17.0, end: 21.0 },
      { text: 'このモデルは燃費25km/Lで、税金も安くエコカー減税対象です。', start: 29.0, end: 35.5 },
      { text: '最小回転半径4.5mで、狭い道でもスムーズです。', start: 47.0, end: 52.0 },
      { text: 'お見積りをお作りしますのでご検討ください。', start: 67.0, end: 71.0 },
    ],
  },
  {
    vehicle: 'セダン',
    budget: '600万円',
    family: '単身',
    purpose: 'ビジネス',
    customerSegments: [
      { text: 'ビジネス用のセダンを探しています。', start: 6.0, end: 9.5 },
      { text: 'ハイグレードモデルで、装備は充実している方がいいです。', start: 18.0, end: 22.5 },
      { text: '予算は600万円程度まで出せます。', start: 32.0, end: 35.5 },
      { text: '納期はどのくらいですか？', start: 55.0, end: 57.5 },
      { text: '前向きに検討します。', start: 75.0, end: 77.0 },
    ],
    salesSegments: [
      { text: 'いらっしゃいませ。本日はどのようなお車をお探しでしょうか。', start: 0, end: 4.5 },
      { text: 'ビジネス用ですね。こちらのプレミアムセダンはいかがでしょうか。', start: 10.0, end: 15.5 },
      { text: '本革シート、サンルーフ、最新のナビゲーションシステムなど充実しております。', start: 23.0, end: 30.0 },
      { text: 'こちらのグレードでしたら予算内に収まります。', start: 36.0, end: 40.5 },
      { text: '現在、約3ヶ月でお渡しできる見込みです。', start: 58.0, end: 62.5 },
      { text: 'ありがとうございます。詳しいお見積りをご用意いたします。', start: 78.0, end: 83.0 },
    ],
  },
  {
    vehicle: 'ミニバン',
    budget: '350万円',
    family: '4人家族',
    purpose: '子育て・ファミリー',
    customerSegments: [
      { text: '子どもが2人いるのでミニバンを検討しています。', start: 7.0, end: 11.0 },
      { text: 'スライドドアは必須です。', start: 18.0, end: 20.5 },
      { text: '予算は350万円前後です。', start: 28.0, end: 31.0 },
      { text: '荷物もたくさん積めますか？', start: 48.0, end: 50.5 },
      { text: '色は何色がありますか？', start: 68.0, end: 70.5 },
      { text: '試乗してみたいです。', start: 85.0, end: 87.0 },
    ],
    salesSegments: [
      { text: 'いらっしゃいませ。ファミリーカーをお探しですか？', start: 0, end: 4.5 },
      { text: 'お子様がいらっしゃるんですね。ミニバンは最適です。', start: 12.0, end: 16.5 },
      { text: 'もちろん両側パワースライドドアです。', start: 21.0, end: 24.5 },
      { text: 'このモデルでしたらご予算に合います。', start: 32.0, end: 36.0 },
      { text: '3列目シートを倒せば大容量のラゲッジスペースになります。', start: 51.0, end: 56.5 },
      { text: 'ホワイト、ブラック、シルバーなど7色ご用意しております。', start: 71.0, end: 76.0 },
      { text: 'かしこまりました。試乗車をご用意いたします。', start: 88.0, end: 92.5 },
    ],
  },
];

// MOCKセッションデータ生成
export function generateMockSessions(count: number = 20): MockSession[] {
  const sessions: MockSession[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const template = conversationTemplates[i % conversationTemplates.length];
    const daysAgo = Math.floor(Math.random() * 30); // 過去30日以内
    const createdAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    
    // 成約率を約40%に設定
    let outcomeLabel: MockSession['outcomeLabel'];
    const rand = Math.random();
    if (rand < 0.40) {
      outcomeLabel = 'won';
    } else if (rand < 0.75) {
      outcomeLabel = 'lost';
    } else if (rand < 0.85) {
      outcomeLabel = 'pending';
    } else {
      outcomeLabel = null; // 未ラベル
    }

    const sentiment: 'positive' | 'neutral' | 'negative' = 
      outcomeLabel === 'won' ? 'positive' :
      outcomeLabel === 'lost' ? 'negative' :
      'neutral';

    const session: MockSession = {
      id: `demo-session-${String(i + 1).padStart(3, '0')}`,
      customerName: customerNames[i % customerNames.length],
      createdAt,
      status: 'completed',
      storeId: storeIds[i % storeIds.length],
      salesPerson: salesPersons[i % salesPersons.length],
      transcription: {
        speakers: [
          {
            id: 'spk-0',
            segments: template.salesSegments.map((seg, idx) => ({
              id: `seg-0-${idx}`,
              ...seg,
            })),
          },
          {
            id: 'spk-1',
            segments: template.customerSegments.map((seg, idx) => ({
              id: `seg-1-${idx}`,
              ...seg,
            })),
          },
        ],
      },
      sentiment: {
        overall: sentiment,
      },
      summary: {
        keyPoints: [
          `顧客は${template.family}向けの${template.vehicle}を探している`,
          `予算は${template.budget}`,
          `主な用途は${template.purpose}`,
          '具体的な要望を持って来店',
        ],
        concerns: 
          outcomeLabel === 'won' ? ['特になし'] :
          outcomeLabel === 'lost' ? ['予算超過', '競合他社との比較検討中'] :
          ['詳細確認が必要', '家族との相談が必要'],
        nextActions:
          outcomeLabel === 'won' ? ['契約手続き', '納車日の調整', '保険の案内'] :
          outcomeLabel === 'lost' ? ['フォローアップ不要'] :
          ['見積もり作成', '試乗予約', '再来店促進'],
        successFactors:
          outcomeLabel === 'won' ? [
            '顧客ニーズの的確な把握',
            '予算に合った提案',
            '丁寧な説明',
          ] : [],
        improvementAreas:
          outcomeLabel === 'lost' ? [
            '価格交渉の余地',
            '追加特典の提案不足',
          ] : outcomeLabel === 'pending' ? [
            '決断を促すクロージング',
          ] : [],
        quotations: [
          {
            speakerSegmentId: 'seg-1-0',
            timeRange: `00:${String(template.customerSegments[0].start).padStart(2, '0')}-00:${String(Math.floor(template.customerSegments[0].end)).padStart(2, '0')}`,
            text: template.customerSegments[0].text,
          },
          {
            speakerSegmentId: 'seg-1-2',
            timeRange: `00:${String(Math.floor(template.customerSegments[2]?.start || 0)).padStart(2, '0')}-00:${String(Math.floor(template.customerSegments[2]?.end || 0)).padStart(2, '0')}`,
            text: template.customerSegments[2]?.text || '',
          },
        ],
      },
      outcomeLabel,
    };

    sessions.push(session);
  }

  // 承認待ちのセッションをいくつか追加（5件）
  for (let i = 0; i < 5; i++) {
    const sessionIndex = count - 10 + i;
    if (sessions[sessionIndex] && !sessions[sessionIndex].outcomeLabel) {
      const requestedAt = new Date(now - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000).toISOString();
      const deadlineExceeded = Math.random() < 0.3; // 30%の確率で期限超過
      
      sessions[sessionIndex].outcomeLabelRequest = {
        id: `req-${String(i + 1).padStart(3, '0')}`,
        outcome: i % 2 === 0 ? 'won' : 'pending',
        reason: i % 2 === 0 ? '顧客が購入を決定' : '顧客が検討中のため',
        requestedBy: salesPersons[i % salesPersons.length],
        requestedAt,
        approvalStatus: 'pending',
        deadlineExceeded,
      };
    }
  }

  return sessions;
}

// KPIデータ生成
export function generateKpiData(sessions: MockSession[]) {
  const storeStats: { [key: string]: { total: number; won: number; lost: number; pending: number } } = {};

  storeIds.forEach(storeId => {
    storeStats[storeId] = { total: 0, won: 0, lost: 0, pending: 0 };
  });

  sessions.forEach(session => {
    const stats = storeStats[session.storeId];
    if (stats) {
      stats.total++;
      if (session.outcomeLabel === 'won') stats.won++;
      else if (session.outcomeLabel === 'lost') stats.lost++;
      else if (session.outcomeLabel === 'pending') stats.pending++;
    }
  });

  return Object.entries(storeStats).map(([storeId, stats]) => ({
    storeId,
    ...stats,
    conversionRate: stats.total > 0 ? (stats.won / stats.total) * 100 : 0,
  }));
}

// 承認キュー生成
export function generateApprovalQueue(sessions: MockSession[]) {
  return sessions
    .filter(s => s.outcomeLabelRequest && s.outcomeLabelRequest.approvalStatus === 'pending')
    .map(s => ({
      id: s.outcomeLabelRequest!.id,
      sessionId: s.id,
      customerName: s.customerName,
      requestedBy: s.outcomeLabelRequest!.requestedBy,
      requestedAt: s.outcomeLabelRequest!.requestedAt,
      outcome: s.outcomeLabelRequest!.outcome,
      reason: s.outcomeLabelRequest!.reason,
      deadlineExceeded: s.outcomeLabelRequest!.deadlineExceeded,
      // セッション詳細情報を追加
      summary: s.summary,
      sentiment: s.sentiment,
      transcription: s.transcription,
    }));
}
