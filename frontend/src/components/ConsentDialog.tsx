'use client';

import { Dialog } from '@/components/baseui/Dialog';
import { Button } from '@/components/baseui/Button';

interface ConsentDialogProps {
  onAccept: () => void;
  onReject: () => void;
}

export function ConsentDialog({ onAccept, onReject }: ConsentDialogProps) {
  return (
    <Dialog open onClose={onReject} title="同意確認">
      <div className="space-y-4">
        <p className="text-gray-300">
          アップロードされた音声データは、以下の目的で使用されます：
        </p>

        <ul className="list-disc list-inside space-y-2 text-sm text-gray-400">
          <li>文字起こし（話者分離を含む）</li>
          <li>個人情報の自動マスキング</li>
          <li>感情分析</li>
          <li>AI による要約生成</li>
          <li>類似商談検索のための索引化</li>
        </ul>

        <p className="text-sm text-gray-400">
          音声原本は解析完了後に自動削除されます。
          分析結果は30日間保持され、その後自動削除されます。
        </p>

        <div className="flex gap-4 pt-4">
          <Button variant="secondary" onClick={onReject} className="flex-1">
            同意しない
          </Button>
          <Button variant="primary" onClick={onAccept} className="flex-1">
            同意する
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
