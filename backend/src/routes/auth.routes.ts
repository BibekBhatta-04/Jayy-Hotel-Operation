import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { loginSchema } from '../schemas/auth.schema';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', validate(loginSchema), (req, res, next) => authController.login(req, res, next));
router.get('/me', authenticate, (req, res, next) => authController.getMe(req, res, next));

export default router;
