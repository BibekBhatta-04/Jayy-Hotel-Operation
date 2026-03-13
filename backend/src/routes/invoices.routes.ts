import { Router } from 'express';
import { invoiceController } from '../controllers/invoices.controller';
import { validate } from '../middleware/validate';
import { addInvoiceItemSchema, updatePaymentSchema } from '../schemas/invoice.schema';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => invoiceController.getInvoices(req, res, next));
router.get('/:id', (req, res, next) => invoiceController.getInvoiceById(req, res, next));
router.post('/:id/items', validate(addInvoiceItemSchema), (req, res, next) => invoiceController.addItem(req, res, next));
router.put('/:id/payment', validate(updatePaymentSchema), (req, res, next) => invoiceController.updatePayment(req, res, next));

export default router;
