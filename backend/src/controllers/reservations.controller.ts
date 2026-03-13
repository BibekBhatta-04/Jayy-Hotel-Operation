import { Request, Response, NextFunction } from 'express';
import { reservationService } from '../services/reservations.service';

function paramId(req: Request): string {
  return req.params.id as string;
}

export class ReservationController {
  async getReservations(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: any = {};
      if (req.query.status) filters.status = req.query.status as string;
      if (req.query.from) filters.from = req.query.from as string;
      if (req.query.to) filters.to = req.query.to as string;
      const reservations = await reservationService.getReservations(filters);
      res.json(reservations);
    } catch (err) { next(err); }
  }

  async getReservationById(req: Request, res: Response, next: NextFunction) {
    try {
      const reservation = await reservationService.getReservationById(paramId(req));
      res.json(reservation);
    } catch (err: any) {
      err.statusCode ? res.status(err.statusCode).json({ error: err.message }) : next(err);
    }
  }

  async getCalendarData(req: Request, res: Response, next: NextFunction) {
    try {
      const from = req.query.from as string;
      const to = req.query.to as string;
      if (!from || !to) {
        res.status(400).json({ error: 'from and to query params required' });
        return;
      }
      const data = await reservationService.getCalendarData(from, to);
      res.json(data);
    } catch (err) { next(err); }
  }

  async createReservation(req: Request, res: Response, next: NextFunction) {
    try {
      const reservation = await reservationService.createReservation(req.body, req.user!.userId);
      res.status(201).json(reservation);
    } catch (err: any) {
      err.statusCode ? res.status(err.statusCode).json({ error: err.message }) : next(err);
    }
  }

  async updateReservation(req: Request, res: Response, next: NextFunction) {
    try {
      const reservation = await reservationService.updateReservation(paramId(req), req.body);
      res.json(reservation);
    } catch (err: any) {
      err.statusCode ? res.status(err.statusCode).json({ error: err.message }) : next(err);
    }
  }

  async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const reservation = await reservationService.checkIn(paramId(req));
      res.json(reservation);
    } catch (err: any) {
      err.statusCode ? res.status(err.statusCode).json({ error: err.message }) : next(err);
    }
  }

  async checkOut(req: Request, res: Response, next: NextFunction) {
    try {
      const reservation = await reservationService.checkOut(paramId(req));
      res.json(reservation);
    } catch (err: any) {
      err.statusCode ? res.status(err.statusCode).json({ error: err.message }) : next(err);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const reservation = await reservationService.cancel(paramId(req));
      res.json(reservation);
    } catch (err: any) {
      err.statusCode ? res.status(err.statusCode).json({ error: err.message }) : next(err);
    }
  }
}

export const reservationController = new ReservationController();
