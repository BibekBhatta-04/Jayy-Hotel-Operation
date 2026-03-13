import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({ error: err.message });
      } else {
        next(err);
      }
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.userId);
      res.json(user);
    } catch (err: any) {
      if (err.statusCode) {
        res.status(err.statusCode).json({ error: err.message });
      } else {
        next(err);
      }
    }
  }
}

export const authController = new AuthController();
