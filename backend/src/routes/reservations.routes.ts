import { Router } from 'express';
import { reservationController } from '../controllers/reservations.controller';
import { validate } from '../middleware/validate';
import { createReservationSchema, updateReservationSchema } from '../schemas/reservation.schema';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => reservationController.getReservations(req, res, next));
router.get('/calendar', (req, res, next) => reservationController.getCalendarData(req, res, next));
router.get('/:id', (req, res, next) => reservationController.getReservationById(req, res, next));
router.post('/', validate(createReservationSchema), (req, res, next) => reservationController.createReservation(req, res, next));
router.put('/:id', validate(updateReservationSchema), (req, res, next) => reservationController.updateReservation(req, res, next));
router.post('/:id/check-in', (req, res, next) => reservationController.checkIn(req, res, next));
router.post('/:id/check-out', (req, res, next) => reservationController.checkOut(req, res, next));
router.post('/:id/cancel', (req, res, next) => reservationController.cancel(req, res, next));

export default router;
