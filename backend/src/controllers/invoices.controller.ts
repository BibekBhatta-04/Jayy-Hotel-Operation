import { Request, Response, NextFunction } from 'express';
import { invoiceService } from '../services/invoices.service';

function paramId(req: Request): string {
  return req.params.id as string;
}

export class InvoiceController {
  async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: any = {};
      if (req.query.paymentStatus) filters.paymentStatus = req.query.paymentStatus as string;
      const invoices = await invoiceService.getInvoices(filters);
      res.json(invoices);
    } catch (err) { next(err); }
  }

  async getInvoiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await invoiceService.getInvoiceById(paramId(req));
      res.json(invoice);
    } catch (err: any) {
      err.statusCode ? res.status(err.statusCode).json({ error: err.message }) : next(err);
    }
  }

  async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await invoiceService.addItem(paramId(req), req.body);
      res.status(201).json(item);
    } catch (err: any) {
      err.statusCode ? res.status(err.statusCode).json({ error: err.message }) : next(err);
    }
  }

  async updatePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await invoiceService.updatePayment(paramId(req), req.body);
      res.json(invoice);
    } catch (err: any) {
      err.statusCode ? res.status(err.statusCode).json({ error: err.message }) : next(err);
    }
  }
}

export const invoiceController = new InvoiceController();
