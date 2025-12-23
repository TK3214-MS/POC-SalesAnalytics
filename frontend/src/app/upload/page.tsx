'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/glass/GlassCard';
import { ConsentDialog } from '@/components/ConsentDialog';
import { AudioUploadDropzone } from '@/components/AudioUploadDropzone';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { PageHeader } from '@/components/PageHeader';

export default function UploadPage() {
  const { t } = useLanguage();
  const [consentGiven, setConsentGiven] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(true);

  const handleConsentAccept = () => {
    setConsentGiven(true);
    setShowConsentDialog(false);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto space-y-8">
        <PageHeader 
          title={t.upload.title}
          subtitle={t.upload.subtitle}
        />

        <GlassCard>
          {!consentGiven ? (
            <div className="p-8 text-center space-y-4">
              <div className="text-6xl">🔒</div>
              <h2 className="text-2xl font-semibold text-black">{t.upload.title}</h2>
              <p className="text-gray-600">
                {t.upload.subtitle}
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
