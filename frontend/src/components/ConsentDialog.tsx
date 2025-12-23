'use client';

import { Dialog } from '@/components/baseui/Dialog';
import { Button } from '@/components/baseui/Button';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface ConsentDialogProps {
  onAccept: () => void;
  onReject: () => void;
}

export function ConsentDialog({ onAccept, onReject }: ConsentDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open onClose={onReject} title={t.consent.title}>
      <div className="space-y-4">
        <p className="text-white">
          {t.consent.description}
        </p>

        <ul className="list-disc list-inside space-y-2 text-sm text-white">
          <li>{t.consent.purpose1}</li>
          <li>{t.consent.purpose2}</li>
          <li>{t.consent.purpose3}</li>
          <li>{t.consent.purpose4}</li>
          <li>{t.consent.purpose5}</li>
        </ul>

        <p className="text-sm text-white">
          {t.consent.retention}
        </p>

        <div className="flex gap-4 pt-4">
          <Button variant="secondary" onClick={onReject} className="flex-1">
            {t.consent.reject}
          </Button>
          <Button variant="primary" onClick={onAccept} className="flex-1">
            {t.consent.accept}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
