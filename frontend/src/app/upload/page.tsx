'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/glass/GlassCard';
import { ConsentDialog } from '@/components/ConsentDialog';
import { AudioUploadDropzone } from '@/components/AudioUploadDropzone';

export default function UploadPage() {
  const [consentGiven, setConsentGiven] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(true);

  const handleConsentAccept = () => {
    setConsentGiven(true);
    setShowConsentDialog(false);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold">音声アップロード</h1>
          <p className="text-gray-300">
            商談音声をアップロードして自動分析を開始します
          </p>
        </header>

        <GlassCard>
          {!consentGiven ? (
            <div className="p-8 text-center space-y-4">
              <div className="text-6xl">🔒</div>
              <h2 className="text-2xl font-semibold">同意が必要です</h2>
              <p className="text-gray-300">
                音声データの取り扱いについて同意いただく必要があります
              </p>
            </div>
          ) : (
            <AudioUploadDropzone />
          )}
        </GlassCard>

        {showConsentDialog && (
          <ConsentDialog
            onAccept={handleConsentAccept}
            onReject={() => setShowConsentDialog(false)}
          />
        )}
      </div>
    </div>
  );
}
