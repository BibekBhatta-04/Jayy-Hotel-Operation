import { Request, Response, NextFunction } from 'express';
import { roomService } from '../services/rooms.service';
import { RoomStatus } from '@prisma/client';

function paramId(req: Request): string {
  return req.params.id as string;
}

export class RoomController {
  async getRoomTypes(_req: Request, res: Response, next: NextFunction) {
    try {
      const types = await roomService.getRoomTypes();
      res.json(types);
    } catch (err) { next(err); }
  }

  async createRoomType(req: Request, res: Response, next: NextFunction) {
    try {
      const type = await roomService.createRoomType(req.body);
      res.status(201).json(type);
    } catch (err) { next(err); }
  }

  async updateRoomType(req: Request, res: Response, next: NextFunction) {
    try {
      const type = await roomService.updateRoomType(paramId(req), req.body);
      res.json(type);
    } catch (err: any) {
      err.statusCode ? res.status(err.statusCode).json({ error: err.message }) : next(err);
    }
  }

  async deleteRoomType(req: Request, res: Response, next: NextFunction) {
    try {
      await roomService.deleteRoomType(paramId(req));
      res.json({ message: 'Room type deleted' });
    } catch (err: any) {
      err.statusCode ? res.status(err.statusCode).json({ error: err.message }) : next(err);
    }
  }

  async getRooms(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: any = {};
      if (req.query.status) filters.status = req.query.status as RoomStatus;
      if (req.query.floor) filters.floor = parseInt(req.query.floor as string);
      if (req.query.roomTypeId) filters.roomTypeId = req.query.roomTypeId as string;
      const rooms = await roomService.getRooms(filters);
      res.json(rooms);
    } catch (err) { next(err); }
  }

  async getRoomById(req: Request, res: Response, next: NextFunction) {
    try {
      const room = await roomService.getRoomById(paramId(req));
      res.json(room);
    } catch (err: any) {
      err.statusCode ? res.status(err.statusCode).json({ error: err.message }) : next(err);
    }
  }

  async createRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const room = await roomService.createRoom(req.body);
      res.status(201).json(room);
    } catch (err) { next(err); }
  }

  async updateRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const room = await roomService.updateRoom(paramId(req), req.body);
      res.json(room);
    } catch (err: any) {
      err.statusCode ? res.status(err.statusCode).json({ error: err.message }) : next(err);
    }
  }

  async deleteRoom(req: Request, res: Response, next: NextFunction) {
    try {
      await roomService.deleteRoom(paramId(req));
      res.json({ message: 'Room deleted' });
    } catch (err: any) {
      err.statusCode ? res.status(err.statusCode).json({ error: err.message }) : next(err);
    }
  }
}

export const roomController = new RoomController();
