import { z } from 'zod';

export const createRoomTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  maxOccupancy: z.number().int().min(1).default(2),
  amenities: z.array(z.string()).default([]),
});

export const updateRoomTypeSchema = createRoomTypeSchema.partial();

export const createRoomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  floor: z.number().int().min(0, 'Floor must be 0 or higher'),
  roomTypeId: z.string().uuid('Invalid room type ID'),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'OUT_OF_ORDER']).default('AVAILABLE'),
  notes: z.string().optional(),
});

export const updateRoomSchema = createRoomSchema.partial();

export type CreateRoomTypeInput = z.infer<typeof createRoomTypeSchema>;
export type UpdateRoomTypeInput = z.infer<typeof updateRoomTypeSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
