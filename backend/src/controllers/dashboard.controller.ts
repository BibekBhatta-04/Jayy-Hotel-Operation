import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';

export class DashboardController {
  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await dashboardService.getStats();
      res.json(stats);
    } catch (err) { next(err); }
  }

  async getTrends(_req: Request, res: Response, next: NextFunction) {
    try {
      const trends = await dashboardService.getBookingTrends();
      res.json(trends);
    } catch (err) { next(err); }
  }

  async getRoomStatus(_req: Request, res: Response, next: NextFunction) {
    try {
      const status = await dashboardService.getRoomStatusOverview();
      res.json(status);
    } catch (err) { next(err); }
  }

  async getRecentReservations(_req: Request, res: Response, next: NextFunction) {
    try {
      const reservations = await dashboardService.getRecentReservations();
      res.json(reservations);
    } catch (err) { next(err); }
  }
}

export const dashboardController = new DashboardController();
