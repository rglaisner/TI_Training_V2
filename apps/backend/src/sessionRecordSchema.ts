import { ProfileMetricsSchema } from '@ti-training/shared';
import { z } from 'zod';

/** Validates Firestore session documents before the API trusts them. */
export const SessionRecordSchema = z.object({
  tenantId: z.string().min(1),
  userId: z.string().min(1),
  scenarioId: z.string().min(1),
  sessionId: z.string().min(1),
  currentNodeId: z.string().min(1),
  currentNodeType: z.enum(['branching', 'open_input']),
  isTerminal: z.boolean(),
  turnId: z.number().int().nonnegative(),
  profileMetrics: ProfileMetricsSchema,
});

export type SessionRecordValidated = z.infer<typeof SessionRecordSchema>;
