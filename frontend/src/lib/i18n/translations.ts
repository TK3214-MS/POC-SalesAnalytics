export type Language = 'ja' | 'en';

export const translations = {
  ja: {
    // Common
    common: {
      loading: '読み込み中...',
      noData: 'データがありません',
      error: 'エラーが発生しました',
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除',
      edit: '編集',
      close: '閉じる',
      confirm: '確認',
      back: '戻る',
      next: '次へ',
      submit: '送信',
      search: '検索',
      filter: 'フィルター',
      viewAll: 'すべて表示',
      showMore: '詳細を表示',
    },
    
    // Navigation
    nav: {
      dashboard: 'ダッシュボード',
      upload: '音声解析',
      sessions: '商談一覧',
      approvals: '承認キュー',
      kpi: 'KPIダッシュボード',
      appName: 'Sales Analytics',
      appDescription: '商談分析システム',
    },
    
    // Dashboard
    dashboard: {
      title: 'ダッシュボード',
      subtitle: '商談音声を分析し、成約率向上を支援',
      totalSessions: '総商談数',
      pendingApprovals: '承認待ち',
      winRate: '成約率',
      uploadTitle: '音声解析',
      uploadDescription: '商談音声をアップロードして自動分析を開始',
      recentSessions: '最近の商談',
      monthlyTrend: '今月の成約推移',
      week: '週',
      won: '成約',
      lost: '失注',
    },
    
    // Upload
    upload: {
      title: '音声ファイルのアップロード',
      subtitle: '商談の音声ファイルをアップロードして分析を開始',
      dropzone: 'ここに音声ファイルをドロップ、またはクリックして選択',
      supportedFormats: '対応形式: MP3, WAV, M4A (最大100MB)',
      customerName: '顧客名',
      customerNamePlaceholder: '例: 田中太郎',
      uploading: 'アップロード中...',
      processing: '処理中...',
      uploadButton: 'アップロード開始',
      success: 'アップロードが完了しました',
      error: 'アップロードに失敗しました',
    },
    
    // Consent Dialog
    consent: {
      title: '同意確認',
      description: 'アップロードされた音声データは、以下の目的で使用されます：',
      purpose1: '文字起こし（話者分離を含む）',
      purpose2: '個人情報の自動マスキング',
      purpose3: '感情分析',
      purpose4: 'AI による要約生成',
      purpose5: '類似商談検索のための索引化',
      retention: '音声原本は解析完了後に自動削除されます。分析結果は30日間保持され、その後自動削除されます。',
      accept: '同意する',
      reject: '同意しない',
    },
    
    // Sessions
    sessions: {
      title: '商談一覧',
      subtitle: '過去の商談記録と分析結果を確認',
      mySessionsTab: '自分の商談',
      allSessionsTab: 'すべての商談',
      customerName: '顧客名',
      createdAt: '作成日時',
      duration: '時間',
      sentiment: '感情分析',
      outcome: '結果',
      actions: '操作',
      viewDetails: '詳細を見る',
      noSessions: '商談データがありません',
      filterByOutcome: '結果でフィルター',
      filterAll: 'すべて',
      filterWon: '成約',
      filterLost: '失注',
      filterPending: '未確定',
    },
    
    // Session Detail
    sessionDetail: {
      title: '商談詳細',
      overview: '概要',
      transcript: '文字起こし',
      analysis: '分析結果',
      timeline: 'タイムライン',
      summary: '要約',
      sentiment: '感情分析',
      keyTopics: '主要トピック',
      actionItems: 'アクションアイテム',
      outcomeLabel: '結果ラベル',
      requestOutcome: '結果を申請',
      positive: 'ポジティブ',
      neutral: 'ニュートラル',
      negative: 'ネガティブ',
      mixed: '混合',
    },
    
    // Approvals
    approvals: {
      title: '承認キュー',
      subtitle: 'Outcome ラベルの承認待ち一覧（同一店舗のみ）',
      noPending: '承認待ちのリクエストはありません',
      requestedBy: '申請者',
      requestedAt: '申請日時',
      proposedOutcome: '申請結果',
      approve: '承認',
      reject: '却下',
      approveSuccess: '承認しました',
      rejectSuccess: '却下しました',
      reason: '理由',
      reasonPlaceholder: '却下理由を入力してください',
    },
    
    // KPI Dashboard
    kpi: {
      title: 'KPI ダッシュボード',
      subtitle: '成約率・店舗別パフォーマンス',
      storePerformance: '店舗別成約率',
      winRateLabel: '成約率',
      sessionsLabel: '商談数',
      trendLabel: '推移',
      lastUpdated: '最終更新',
      exportData: 'データをエクスポート',
    },
    
    // User
    user: {
      profile: 'プロフィール',
      settings: '設定',
      logout: 'ログアウト',
      demoUser: 'Demo User',
    },
    
    // Errors
    errors: {
      fileRequired: 'ファイルを選択してください',
      customerNameRequired: '顧客名を入力してください',
      fileTooLarge: 'ファイルサイズが大きすぎます',
      invalidFileType: 'サポートされていないファイル形式です',
      uploadFailed: 'アップロードに失敗しました',
      networkError: 'ネットワークエラーが発生しました',
    },
  },
  
  en: {
    // Common
    common: {
      loading: 'Loading...',
      noData: 'No data available',
      error: 'An error occurred',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      search: 'Search',
      filter: 'Filter',
      viewAll: 'View All',
      showMore: 'Show Details',
    },
    
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      upload: 'Voice Analysis',
      sessions: 'Sessions',
      approvals: 'Approval Queue',
      kpi: 'KPI Dashboard',
      appName: 'Sales Analytics',
      appDescription: 'Sales Analysis System',
    },
    
    // Dashboard
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Analyze sales conversations and improve win rates',
      totalSessions: 'Total Sessions',
      pendingApprovals: 'Pending Approvals',
      winRate: 'Win Rate',
      uploadTitle: 'Voice Analysis',
      uploadDescription: 'Upload sales audio for automatic analysis',
      recentSessions: 'Recent Sessions',
      monthlyTrend: 'Monthly Win Rate Trend',
      week: 'Week',
      won: 'Won',
      lost: 'Lost',
    },
    
    // Upload
    upload: {
      title: 'Upload Audio File',
      subtitle: 'Upload a sales conversation audio file to start analysis',
      dropzone: 'Drop audio file here, or click to select',
      supportedFormats: 'Supported formats: MP3, WAV, M4A (max 100MB)',
      customerName: 'Customer Name',
      customerNamePlaceholder: 'e.g., John Doe',
      uploading: 'Uploading...',
      processing: 'Processing...',
      uploadButton: 'Start Upload',
      success: 'Upload completed successfully',
      error: 'Upload failed',
    },
    
    // Consent Dialog
    consent: {
      title: 'Consent Confirmation',
      description: 'The uploaded audio data will be used for the following purposes:',
      purpose1: 'Transcription (including speaker diarization)',
      purpose2: 'Automatic masking of personally identifiable information',
      purpose3: 'Sentiment analysis',
      purpose4: 'AI-generated summaries',
      purpose5: 'Indexing for similar conversation search',
      retention: 'Audio files are automatically deleted after analysis. Analysis results are retained for 30 days and then automatically deleted.',
      accept: 'I Agree',
      reject: 'I Disagree',
    },
    
    // Sessions
    sessions: {
      title: 'Sessions',
      subtitle: 'View past sales conversations and analysis results',
      mySessionsTab: 'My Sessions',
      allSessionsTab: 'All Sessions',
      customerName: 'Customer Name',
      createdAt: 'Created At',
      duration: 'Duration',
      sentiment: 'Sentiment',
      outcome: 'Outcome',
      actions: 'Actions',
      viewDetails: 'View Details',
      noSessions: 'No sessions available',
      filterByOutcome: 'Filter by Outcome',
      filterAll: 'All',
      filterWon: 'Won',
      filterLost: 'Lost',
      filterPending: 'Pending',
    },
    
    // Session Detail
    sessionDetail: {
      title: 'Session Details',
      overview: 'Overview',
      transcript: 'Transcript',
      analysis: 'Analysis',
      timeline: 'Timeline',
      summary: 'Summary',
      sentiment: 'Sentiment Analysis',
      keyTopics: 'Key Topics',
      actionItems: 'Action Items',
      outcomeLabel: 'Outcome Label',
      requestOutcome: 'Request Outcome',
      positive: 'Positive',
      neutral: 'Neutral',
      negative: 'Negative',
      mixed: 'Mixed',
    },
    
    // Approvals
    approvals: {
      title: 'Approval Queue',
      subtitle: 'Pending outcome label requests (same store only)',
      noPending: 'No pending approval requests',
      requestedBy: 'Requested By',
      requestedAt: 'Requested At',
      proposedOutcome: 'Proposed Outcome',
      approve: 'Approve',
      reject: 'Reject',
      approveSuccess: 'Approved successfully',
      rejectSuccess: 'Rejected successfully',
      reason: 'Reason',
      reasonPlaceholder: 'Enter rejection reason',
    },
    
    // KPI Dashboard
    kpi: {
      title: 'KPI Dashboard',
      subtitle: 'Win rates and store performance metrics',
      storePerformance: 'Store Win Rates',
      winRateLabel: 'Win Rate',
      sessionsLabel: 'Sessions',
      trendLabel: 'Trend',
      lastUpdated: 'Last Updated',
      exportData: 'Export Data',
    },
    
    // User
    user: {
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout',
      demoUser: 'Demo User',
    },
    
    // Errors
    errors: {
      fileRequired: 'Please select a file',
      customerNameRequired: 'Please enter customer name',
      fileTooLarge: 'File size is too large',
      invalidFileType: 'Unsupported file format',
      uploadFailed: 'Upload failed',
      networkError: 'Network error occurred',
    },
  },
} as const;

export type TranslationKeys = typeof translations.ja;
