import { z } from 'zod';

export const createReservationSchema = z.object({
  roomId: z.string().uuid('Invalid room ID'),
  guestId: z.string().uuid('Invalid guest ID'),
  checkInDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid check-in date'),
  checkOutDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid check-out date'),
  totalAmount: z.number().min(0, 'Amount must be 0 or positive'),
  paymentMethod: z.enum(['CASH', 'CARD', 'ESEWA', 'FONEPAY', 'MOBILE_BANKING']).default('CASH'),
  specialRequests: z.string().optional(),
  adults: z.number().int().min(1).default(1),
  children: z.number().int().min(0).default(0),
}).refine(
  (data) => new Date(data.checkOutDate) > new Date(data.checkInDate),
  { message: 'Check-out date must be after check-in date', path: ['checkOutDate'] }
);

export const updateReservationSchema = z.object({
  checkInDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date').optional(),
  checkOutDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date').optional(),
  totalAmount: z.number().min(0).optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'ESEWA', 'FONEPAY', 'MOBILE_BANKING']).optional(),
  specialRequests: z.string().optional(),
  adults: z.number().int().min(1).optional(),
  children: z.number().int().min(0).optional(),
});

export const shiftRoomSchema = z.object({
  newRoomId: z.string().uuid('Invalid room ID'),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;
export type ShiftRoomInput = z.infer<typeof shiftRoomSchema>;
