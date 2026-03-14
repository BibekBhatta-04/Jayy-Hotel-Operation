import prisma from '../utils/prisma';
import { CreateGuestInput, UpdateGuestInput } from '../schemas/guest.schema';

export class GuestService {
  async getGuests(search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { idNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.guest.findMany({
      where,
      include: { _count: { select: { reservations: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getGuestById(id: string) {
    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        reservations: {
          include: { room: { include: { roomType: true } } },
          orderBy: { checkInDate: 'desc' },
        },
      },
    });
    if (!guest) throw Object.assign(new Error('Guest not found'), { statusCode: 404 });
    return guest;
  }

  async createGuest(data: CreateGuestInput) {
    return prisma.guest.create({ data: { ...data, email: data.email || null } });
  }

  async updateGuest(id: string, data: UpdateGuestInput) {
    return prisma.guest.update({
      where: { id },
      data: { ...data, email: data.email || null },
    });
  }

  async deleteGuest(id: string) {
    // Only block if guest has ACTIVE reservations (Confirmed or Checked-In)
    const activeReservations = await prisma.reservation.count({
      where: { guestId: id, status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
    });
    if (activeReservations > 0) {
      throw Object.assign(new Error('Cannot delete guest with active reservations'), { statusCode: 400 });
    }
    return prisma.guest.delete({ where: { id } });
  }
}

export const guestService = new GuestService();
