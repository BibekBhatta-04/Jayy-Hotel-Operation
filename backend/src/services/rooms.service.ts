import prisma from '../utils/prisma';
import { CreateRoomInput, UpdateRoomInput, CreateRoomTypeInput, UpdateRoomTypeInput } from '../schemas/room.schema';
import { RoomStatus } from '@prisma/client';

export class RoomService {
  // ─── Room Types ──────────────────────────────────────

  async getRoomTypes() {
    return prisma.roomType.findMany({
      include: { _count: { select: { rooms: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createRoomType(data: CreateRoomTypeInput) {
    return prisma.roomType.create({ data });
  }

  async updateRoomType(id: string, data: UpdateRoomTypeInput) {
    return prisma.roomType.update({ where: { id }, data });
  }

  async deleteRoomType(id: string) {
    const roomCount = await prisma.room.count({ where: { roomTypeId: id } });
    if (roomCount > 0) {
      throw Object.assign(new Error('Cannot delete room type with existing rooms'), { statusCode: 400 });
    }
    return prisma.roomType.delete({ where: { id } });
  }

  // ─── Rooms ───────────────────────────────────────────

  async getRooms(filters?: { status?: RoomStatus; floor?: number; roomTypeId?: string }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.floor !== undefined) where.floor = filters.floor;
    if (filters?.roomTypeId) where.roomTypeId = filters.roomTypeId;

    return prisma.room.findMany({
      where,
      include: { roomType: true },
      orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
    });
  }

  async getRoomById(id: string) {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        roomType: true,
        reservations: {
          where: {
            status: { in: ['CONFIRMED', 'CHECKED_IN'] },
          },
          include: { guest: true },
          take: 5,
          orderBy: { checkInDate: 'desc' },
        },
      },
    });
    if (!room) throw Object.assign(new Error('Room not found'), { statusCode: 404 });
    return room;
  }

  async createRoom(data: CreateRoomInput) {
    return prisma.room.create({
      data,
      include: { roomType: true },
    });
  }

  async updateRoom(id: string, data: UpdateRoomInput) {
    return prisma.room.update({
      where: { id },
      data,
      include: { roomType: true },
    });
  }

  async deleteRoom(id: string) {
    const activeReservations = await prisma.reservation.count({
      where: { roomId: id, status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
    });
    if (activeReservations > 0) {
      throw Object.assign(new Error('Cannot delete room with active reservations'), { statusCode: 400 });
    }
    return prisma.room.delete({ where: { id } });
  }
}

export const roomService = new RoomService();
