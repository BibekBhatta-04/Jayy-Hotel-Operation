import { z } from 'zod';

export const createGuestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone is required'),
  idNumber: z.string().optional(),
  address: z.string().optional(),
  maritalStatus: z.string().optional(),
  occupancyType: z.string().default('Single'),
  nationality: z.string().optional(),
  passportNo: z.string().optional(),
  pax: z.number().int().min(1).optional(),
  tariff: z.number().min(0).optional(),
  plan: z.string().optional(),
  contactNo: z.string().optional(),
  agent: z.string().optional(),
  notes: z.string().optional(),
});

export const updateGuestSchema = createGuestSchema.partial();

export type CreateGuestInput = z.infer<typeof createGuestSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
