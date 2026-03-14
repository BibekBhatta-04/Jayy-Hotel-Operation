import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notifications.service';

class NotificationsController {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const notifications = await notificationService.getNotifications(userId);
      const unreadCount = await notificationService.getUnreadCount(userId);
      res.json({ notifications, unreadCount });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.markAsRead(req.params.id as string);
      res.json(notification);
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      await notificationService.markAllAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationsController = new NotificationsController();
