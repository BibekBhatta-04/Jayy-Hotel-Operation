import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/stats', (req, res, next) => dashboardController.getStats(req, res, next));
router.get('/trends', (req, res, next) => dashboardController.getTrends(req, res, next));
router.get('/room-status', (req, res, next) => dashboardController.getRoomStatus(req, res, next));
router.get('/recent-reservations', (req, res, next) => dashboardController.getRecentReservations(req, res, next));

export default router;
