import { Router } from 'express';
import { roomController } from '../controllers/rooms.controller';
import { validate } from '../middleware/validate';
import { createRoomSchema, updateRoomSchema, createRoomTypeSchema, updateRoomTypeSchema } from '../schemas/room.schema';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Room Types
router.get('/types', (req, res, next) => roomController.getRoomTypes(req, res, next));
router.post('/types', validate(createRoomTypeSchema), (req, res, next) => roomController.createRoomType(req, res, next));
router.put('/types/:id', validate(updateRoomTypeSchema), (req, res, next) => roomController.updateRoomType(req, res, next));
router.delete('/types/:id', (req, res, next) => roomController.deleteRoomType(req, res, next));

// Rooms
router.get('/', (req, res, next) => roomController.getRooms(req, res, next));
router.get('/:id', (req, res, next) => roomController.getRoomById(req, res, next));
router.post('/', validate(createRoomSchema), (req, res, next) => roomController.createRoom(req, res, next));
router.put('/:id', validate(updateRoomSchema), (req, res, next) => roomController.updateRoom(req, res, next));
router.delete('/:id', (req, res, next) => roomController.deleteRoom(req, res, next));

export default router;
