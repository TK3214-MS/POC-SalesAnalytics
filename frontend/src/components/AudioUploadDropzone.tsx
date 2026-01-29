'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/baseui/Button';
import { apiClient } from '@/app/api-proxy';

type ProcessingStage = 
  | 'uploading'
  | 'transcribing'
  | 'analyzing-sentiment'
  | 'generating-summary'
  | 'completing'
  | null;

const stageLabels: Record<Exclude<ProcessingStage, null>, string> = {
  uploading: 'ファイルを読み込んでいます...',
  transcribing: '音声を文字起こししています...',
  'analyzing-sentiment': '感情分析を実行しています...',
  'generating-summary': '要約を生成しています...',
  completing: '処理を完了しています...',
};

const stageProgress: Record<Exclude<ProcessingStage, null>, number> = {
  uploading: 20,
  transcribing: 40,
  'analyzing-sentiment': 60,
  'generating-summary': 80,
  completing: 95,
};

// デモモードチェック
function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('appMode') === 'demo';
}

export function AudioUploadDropzone() {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [textMode, setTextMode] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [processingStage, setProcessingStage] = useState<ProcessingStage>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type.startsWith('audio/') || droppedFile.type === 'text/plain' || droppedFile.name.endsWith('.txt'))) {
      setFile(droppedFile);
      if (droppedFile.type === 'text/plain' || droppedFile.name.endsWith('.txt')) {
        setTextMode(true);
      } else {
        setTextMode(false);
      }
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type === 'text/plain' || selectedFile.name.endsWith('.txt')) {
        setTextMode(true);
      } else {
        setTextMode(false);
      }
    }
  }, []);

  const simulateProcessing = async (stages: ProcessingStage[], delays: number[]) => {
    for (let i = 0; i < stages.length; i++) {
      setProcessingStage(stages[i]);
      await new Promise(resolve => setTimeout(resolve, delays[i]));
    }
  };

  const handleUpload = async () => {
    if (textMode && !textContent.trim() && !file) {
      alert('テキストを入力またはファイルを選択してください');
      return;
    }
    if (!textMode && !file) {
      alert('ファイルを選択してください');
      return;
    }

    setUploading(true);
    try {
      let response;
      if (textMode) {
        // テキストモードの場合
        let textToUpload = textContent;
        
        // ファイルが選択されている場合はファイルから読み込み
        if (file) {
          setProcessingStage('uploading');
          await new Promise(resolve => setTimeout(resolve, 800));
          textToUpload = await file.text();
        } else {
          // 直接入力の場合もuploadingステージから開始
          setProcessingStage('uploading');
          await new Promise(resolve => setTimeout(resolve, 600));
        }
        
        // リアルな処理アニメーション
        await simulateProcessing(
          ['transcribing', 'analyzing-sentiment', 'generating-summary', 'completing'],
          [1500, 1800, 2000, 1200]
        );
        
        response = await apiClient.post('/UploadAudio', {
          text: textToUpload,
          consentGiven: 'true',
        });
        
        setTextContent('');
        setFile(null);
        
        // 完了後、少し待ってからリダイレクト
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // セッション詳細ページにリダイレクト
        if (response && response.sessionId) {
          router.push(`/sessions/${response.sessionId}`);
        }
      } else {
        // 音声ファイルモードの場合
        setProcessingStage('uploading');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const formData = new FormData();
        formData.append('audio', file!);
        formData.append('consentGiven', 'true');

        // リアルな処理アニメーション
        await simulateProcessing(
          ['transcribing', 'analyzing-sentiment', 'generating-summary', 'completing'],
          [2000, 2200, 2500, 1300]
        );

        response = await apiClient.post('/UploadAudio', formData);
        setFile(null);
        
        // 完了後、少し待ってからリダイレクト
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // セッション詳細ページにリダイレクト
        if (response && response.sessionId) {
          router.push(`/sessions/${response.sessionId}`);
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('アップロードに失敗しました');
    } finally {
      setUploading(false);
      setProcessingStage(null);
    }
  };

  const demoMode = isDemoMode();

  // 処理中のオーバーレイ表示
  if (processingStage) {
    const progress = stageProgress[processingStage];
    const label = stageLabels[processingStage];
    
    return (
      <GlassCard>
        <div className="p-12">
          <div className="max-w-md mx-auto space-y-8">
            {/* アニメーションアイコン */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center animate-pulse">
                  <svg className="w-12 h-12 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-full bg-emerald-400 opacity-20 animate-ping"></div>
              </div>
            </div>

            {/* ステージラベル */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">分析中</h3>
              <p className="text-lg text-gray-700">{label}</p>
            </div>

            {/* プログレスバー */}
            <div className="space-y-3">
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-center text-sm text-gray-600">{progress}%</p>
            </div>

            {/* 処理ステップインジケーター */}
            <div className="flex justify-between items-center px-4">
              {(['uploading', 'transcribing', 'analyzing-sentiment', 'generating-summary', 'completing'] as const).map((stage, idx) => (
                <div key={stage} className="flex flex-col items-center gap-2">
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    stageProgress[processingStage] >= stageProgress[stage]
                      ? 'bg-emerald-500 scale-125'
                      : 'bg-gray-300'
                  }`}></div>
                  {idx < 4 && (
                    <div className={`w-12 h-0.5 transition-all duration-300 ${
                      stageProgress[processingStage] > stageProgress[stage]
                        ? 'bg-emerald-500'
                        : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>

            {/* メッセージ */}
            <div className="text-center text-sm text-gray-500 animate-pulse">
              この処理には数秒かかる場合があります
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="p-8">
        {demoMode && (
          <div className="mb-6 flex gap-4 justify-center">
            <Button
              variant={!textMode ? 'primary' : 'secondary'}
              onClick={() => {
                setTextMode(false);
                setTextContent('');
              }}
            >
              🎵 音声ファイル
            </Button>
            <Button
              variant={textMode ? 'primary' : 'secondary'}
              onClick={() => {
                setTextMode(true);
                setFile(null);
              }}
            >
              📝 テキスト
            </Button>
          </div>
        )}

        {textMode ? (
          <div className="space-y-6">
            {file ? (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-success to-green-600 mb-4">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-black">{file.name}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button variant="secondary" onClick={() => setFile(null)}>
                    キャンセル
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    {uploading ? 'アップロード中...' : 'アップロード'}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 mb-4">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-black">文字起こしテキストをアップロード</p>
                  <p className="text-sm text-gray-600 mt-2">
                    デモモード: .txtファイルまたは直接入力
                  </p>
                </div>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all mb-4 ${
                    dragging
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-white/30 hover:border-white/50'
                  }`}
                >
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept=".txt,text/plain"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="space-y-3">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-500">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-lg font-semibold text-black">テキストファイルをドロップ</p>
                      <p className="text-sm text-gray-600">または</p>
                      <Button variant="primary" as="span">
                        ファイルを選択
                      </Button>
                    </div>
                  </label>
                </div>
                <div className="text-center text-sm text-gray-600 mb-3">または直接入力</div>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="w-full h-48 p-4 rounded-lg border-2 border-white/30 bg-white/10 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  placeholder="営業: いらっしゃいませ。本日はどのようなお車をお探しでしょうか？&#10;顧客: 家族向けのSUVを探しています。&#10;営業: ご家族構成はどのような感じでしょうか？&#10;..."
                />
                <div className="flex gap-4 justify-center">
                  <Button variant="secondary" onClick={() => setTextContent('')}>
                    クリア
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleUpload}
                    disabled={uploading || !textContent.trim()}
                  >
                    {uploading ? 'アップロード中...' : 'テキストをアップロード'}
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              dragging
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-white/30 hover:border-white/50'
            }`}
          >
            {file ? (
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-success to-green-600 mb-2">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-black">{file.name}</p>
                <p className="text-sm text-gray-600">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className="flex gap-4 justify-center">
                  <Button variant="secondary" onClick={() => setFile(null)}>
                    キャンセル
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    {uploading ? 'アップロード中...' : 'アップロード'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 mb-2">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-black">音声ファイルをドロップ</p>
                <p className="text-sm text-gray-600">または</p>
                <label className="inline-block">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button variant="primary" as="span">
                    ファイルを選択
                  </Button>
                </label>
              </div>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
