import { z } from 'zod';

export const UploadAudioSchema = z.object({
  consentGiven: z.boolean().refine((val) => val === true, {
    message: '同意が必要です',
  }),
  audioFile: z.instanceof(File).refine(
    (file) => file.type.startsWith('audio/'),
    { message: '音声ファイルのみアップロード可能です' }
  ),
});

export const OutcomeRequestSchema = z.object({
  sessionId: z.string().min(1),
  outcome: z.enum(['won', 'lost', 'pending', 'canceled']),
  reason: z.string().optional(),
});

export const ApprovalActionSchema = z.object({
  requestId: z.string().min(1),
  reason: z.string().optional(),
});

export type UploadAudioInput = z.infer<typeof UploadAudioSchema>;
export type OutcomeRequestInput = z.infer<typeof OutcomeRequestSchema>;
export type ApprovalActionInput = z.infer<typeof ApprovalActionSchema>;
