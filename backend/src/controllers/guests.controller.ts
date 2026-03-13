import { Request, Response, NextFunction } from 'express';
import { guestService } from '../services/guests.service';

function paramId(req: Request): string {
  return req.params.id as string;
}

export class GuestController {
  async getGuests(req: Request, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string | undefined;
      const guests = await guestService.getGuests(search);
      res.json(guests);
    } catch (err) { next(err); }
  }

  async getGuestById(req: Request, res: Response, next: NextFunction) {
    try {
      const guest = await guestService.getGuestById(paramId(req));
      res.json(guest);
    } catch (err: any) {
      err.statusCode ? res.status(err.statusCode).json({ error: err.message }) : next(err);
    }
  }

  async createGuest(req: Request, res: Response, next: NextFunction) {
    try {
      const guest = await guestService.createGuest(req.body);
      res.status(201).json(guest);
    } catch (err) { next(err); }
  }

  async updateGuest(req: Request, res: Response, next: NextFunction) {
    try {
      const guest = await guestService.updateGuest(paramId(req), req.body);
      res.json(guest);
    } catch (err: any) {
      err.statusCode ? res.status(err.statusCode).json({ error: err.message }) : next(err);
    }
  }

  async deleteGuest(req: Request, res: Response, next: NextFunction) {
    try {
      await guestService.deleteGuest(paramId(req));
      res.json({ message: 'Guest deleted' });
    } catch (err: any) {
      err.statusCode ? res.status(err.statusCode).json({ error: err.message }) : next(err);
    }
  }
}

export const guestController = new GuestController();
