import { Router } from 'express';
import { guestController } from '../controllers/guests.controller';
import { validate } from '../middleware/validate';
import { createGuestSchema, updateGuestSchema } from '../schemas/guest.schema';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => guestController.getGuests(req, res, next));
router.get('/:id', (req, res, next) => guestController.getGuestById(req, res, next));
router.post('/', validate(createGuestSchema), (req, res, next) => guestController.createGuest(req, res, next));
router.put('/:id', validate(updateGuestSchema), (req, res, next) => guestController.updateGuest(req, res, next));
router.delete('/:id', (req, res, next) => guestController.deleteGuest(req, res, next));

export default router;
