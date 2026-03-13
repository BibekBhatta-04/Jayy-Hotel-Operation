import { z } from 'zod';

export const addInvoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.number().positive('Price must be positive'),
});

export const updatePaymentSchema = z.object({
  paymentStatus: z.enum(['PENDING', 'PAID', 'PARTIAL', 'REFUNDED']),
  paymentMethod: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'ONLINE', 'OTHER']).optional(),
  discount: z.number().min(0).optional(),
});

export type AddInvoiceItemInput = z.infer<typeof addInvoiceItemSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
