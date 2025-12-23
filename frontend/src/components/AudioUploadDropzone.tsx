'use client';

import { useState, useCallback } from 'react';
import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/baseui/Button';
import { apiClient } from '@/app/api-proxy';

export function AudioUploadDropzone() {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

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
    if (droppedFile && droppedFile.type.startsWith('audio/')) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('consentGiven', 'true');

      await apiClient.post('/UploadAudio', formData);
      alert('アップロード成功！分析を開始しました。');
      setFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('アップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  return (
    <GlassCard>
      <div className="p-8">
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
              <div className="text-4xl">🎵</div>
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
              <div className="text-6xl">🎤</div>
              <p className="text-xl text-black">音声ファイルをドロップ</p>
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
      </div>
    </GlassCard>
  );
}
