import { Router } from 'express';
import { notificationsController } from '../controllers/notifications.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, (req, res, next) => notificationsController.getNotifications(req, res, next));
router.put('/:id/read', authenticate, (req, res, next) => notificationsController.markAsRead(req, res, next));
router.put('/read-all', authenticate, (req, res, next) => notificationsController.markAllAsRead(req, res, next));

export default router;
