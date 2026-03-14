import { z } from 'zod';

export const createNotificationSchema = z.object({
  type: z.string(),
  title: z.string(),
  message: z.string(),
  userId: z.string().uuid(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
