import prisma from '../utils/prisma';
import { AddInvoiceItemInput, UpdatePaymentInput } from '../schemas/invoice.schema';

export class InvoiceService {
  async getInvoices(filters?: { paymentStatus?: string }) {
    const where: any = {};
    if (filters?.paymentStatus) where.paymentStatus = filters.paymentStatus;

    return prisma.invoice.findMany({
      where,
      include: {
        reservation: {
          include: {
            guest: true,
            room: { include: { roomType: true } },
          },
        },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInvoiceById(id: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        reservation: {
          include: {
            guest: true,
            room: { include: { roomType: true } },
            createdBy: { select: { name: true } },
          },
        },
        items: true,
      },
    });
    if (!invoice) throw Object.assign(new Error('Invoice not found'), { statusCode: 404 });
    return invoice;
  }

  async addItem(invoiceId: string, data: AddInvoiceItemInput) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw Object.assign(new Error('Invoice not found'), { statusCode: 404 });

    const totalPrice = data.quantity * data.unitPrice;

    const item = await prisma.invoiceItem.create({
      data: {
        invoiceId,
        description: data.description,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        totalPrice,
      },
    });

    // Recalculate invoice totals
    await this.recalculateInvoice(invoiceId);
    return item;
  }

  async updatePayment(invoiceId: string, data: UpdatePaymentInput) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw Object.assign(new Error('Invoice not found'), { statusCode: 404 });

    const updateData: any = { paymentStatus: data.paymentStatus };
    if (data.paymentMethod) updateData.paymentMethod = data.paymentMethod;
    if (data.paymentStatus === 'PAID') updateData.paidAt = new Date();
    if (data.discount !== undefined) {
      updateData.discount = data.discount;
    }

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: updateData,
      include: {
        reservation: { include: { guest: true, room: { include: { roomType: true } } } },
        items: true,
      },
    });

    // Recalculate if discount changed
    if (data.discount !== undefined) {
      await this.recalculateInvoice(invoiceId);
    }

    return updated;
  }

  private async recalculateInvoice(invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { items: true },
    });

    if (!invoice) return;

    const subtotal = invoice.items.reduce((sum, item) => sum + Number(item.totalPrice), 0);
    const taxAmount = (subtotal - Number(invoice.discount)) * (Number(invoice.taxRate) / 100);
    const totalAmount = subtotal - Number(invoice.discount) + taxAmount;

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { subtotal, taxAmount, totalAmount },
    });
  }
}

export const invoiceService = new InvoiceService();
