import prisma from '../utils/prisma';
import { CreateReservationInput, UpdateReservationInput } from '../schemas/reservation.schema';
import { notificationService } from './notifications.service';

export class ReservationService {
  async getReservations(filters?: { status?: string; from?: string; to?: string }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.from || filters?.to) {
      where.checkInDate = {};
      if (filters.from) where.checkInDate.gte = new Date(filters.from);
      if (filters.to) where.checkInDate.lte = new Date(filters.to);
    }

    return prisma.reservation.findMany({
      where,
      include: {
        room: { include: { roomType: true } },
        guest: true,
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReservationById(id: string) {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        room: { include: { roomType: true } },
        guest: true,
        createdBy: { select: { id: true, name: true } },
        invoice: { include: { items: true } },
      },
    });
    if (!reservation) throw Object.assign(new Error('Reservation not found'), { statusCode: 404 });
    return reservation;
  }

  async getCalendarData(from: string, to: string) {
    return prisma.reservation.findMany({
      where: {
        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        OR: [
          { checkInDate: { gte: new Date(from), lte: new Date(to) } },
          { checkOutDate: { gte: new Date(from), lte: new Date(to) } },
          { checkInDate: { lte: new Date(from) }, checkOutDate: { gte: new Date(to) } },
        ],
      },
      include: {
        room: { include: { roomType: true } },
        guest: { select: { id: true, name: true } },
      },
      orderBy: { checkInDate: 'asc' },
    });
  }

  async createReservation(data: CreateReservationInput, userId: string) {
    const conflict = await this.checkRoomAvailability(
      data.roomId,
      new Date(data.checkInDate),
      new Date(data.checkOutDate)
    );

    if (conflict) {
      throw Object.assign(
        new Error(`Room is already booked from ${conflict.checkInDate.toISOString().split('T')[0]} to ${conflict.checkOutDate.toISOString().split('T')[0]}`),
        { statusCode: 409 }
      );
    }

    const reservation = await prisma.reservation.create({
      data: {
        roomId: data.roomId,
        guestId: data.guestId,
        checkInDate: new Date(data.checkInDate),
        checkOutDate: new Date(data.checkOutDate),
        totalAmount: data.totalAmount,
        paymentMethod: data.paymentMethod,
        specialRequests: data.specialRequests,
        adults: data.adults,
        children: data.children,
        createdById: userId,
      },
      include: {
        room: { include: { roomType: true } },
        guest: true,
      },
    });

    await prisma.room.update({
      where: { id: data.roomId },
      data: { status: 'RESERVED' },
    });

    // Notification
    await notificationService.create({
      type: 'RESERVATION',
      title: 'New Reservation',
      message: `Reservation created for ${reservation.guest.name} in Room ${reservation.room.roomNumber}`,
      userId,
    });

    return reservation;
  }

  async updateReservation(id: string, data: UpdateReservationInput) {
    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) throw Object.assign(new Error('Reservation not found'), { statusCode: 404 });

    if (['CHECKED_OUT', 'CANCELLED'].includes(reservation.status)) {
      throw Object.assign(new Error('Cannot modify a completed or cancelled reservation'), { statusCode: 400 });
    }

    if (data.checkInDate || data.checkOutDate) {
      const checkIn = data.checkInDate ? new Date(data.checkInDate) : reservation.checkInDate;
      const checkOut = data.checkOutDate ? new Date(data.checkOutDate) : reservation.checkOutDate;

      const conflict = await this.checkRoomAvailability(reservation.roomId, checkIn, checkOut, id);
      if (conflict) {
        throw Object.assign(new Error('Room is not available for the selected dates'), { statusCode: 409 });
      }
    }

    return prisma.reservation.update({
      where: { id },
      data: {
        ...data,
        checkInDate: data.checkInDate ? new Date(data.checkInDate) : undefined,
        checkOutDate: data.checkOutDate ? new Date(data.checkOutDate) : undefined,
      },
      include: {
        room: { include: { roomType: true } },
        guest: true,
      },
    });
  }

  async checkIn(id: string, userId: string) {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { room: true, guest: true },
    });

    if (!reservation) throw Object.assign(new Error('Reservation not found'), { statusCode: 404 });
    if (reservation.status !== 'CONFIRMED') {
      throw Object.assign(new Error('Only confirmed reservations can be checked in'), { statusCode: 400 });
    }

    // Block check-in if room is Out of Order
    if (reservation.room.status === 'OUT_OF_ORDER') {
      throw Object.assign(
        new Error('Room is currently Out of Order. Check-in is not allowed.'),
        { statusCode: 400 }
      );
    }

    const [updated] = await prisma.$transaction([
      prisma.reservation.update({
        where: { id },
        data: { status: 'CHECKED_IN' },
        include: { room: { include: { roomType: true } }, guest: true },
      }),
      prisma.room.update({
        where: { id: reservation.roomId },
        data: { status: 'OCCUPIED' },
      }),
    ]);

    // Notification
    await notificationService.create({
      type: 'CHECK_IN',
      title: 'Guest Checked In',
      message: `${reservation.guest.name} checked into Room ${reservation.room.roomNumber}`,
      userId,
    });

    return updated;
  }

  async checkOut(id: string, userId: string) {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { room: { include: { roomType: true } }, guest: true, invoice: true },
    });

    if (!reservation) throw Object.assign(new Error('Reservation not found'), { statusCode: 404 });
    if (reservation.status !== 'CHECKED_IN') {
      throw Object.assign(new Error('Only checked-in reservations can be checked out'), { statusCode: 400 });
    }

    const checkIn = new Date(reservation.checkInDate);
    const checkOut = new Date(reservation.checkOutDate);
    const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));

    const subtotal = Number(reservation.totalAmount);
    const taxRate = 13;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    const invoiceCount = await prisma.invoice.count();
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(5, '0')}`;

    const [updated] = await prisma.$transaction([
      prisma.reservation.update({
        where: { id },
        data: { status: 'CHECKED_OUT' },
        include: { room: { include: { roomType: true } }, guest: true },
      }),
      prisma.room.update({
        where: { id: reservation.roomId },
        data: { status: 'AVAILABLE' },
      }),
      ...(reservation.invoice
        ? []
        : [
            prisma.invoice.create({
              data: {
                invoiceNumber,
                reservationId: id,
                subtotal,
                taxRate,
                taxAmount,
                totalAmount,
                paymentStatus: 'PAID',
                paymentMethod: reservation.paymentMethod,
                paidAt: new Date(),
                items: {
                  create: {
                    description: `Room ${reservation.room.roomNumber} (${reservation.room.roomType.name}) - ${nights} night(s)`,
                    quantity: nights,
                    unitPrice: subtotal / nights,
                    totalPrice: subtotal,
                  },
                },
              },
            }),
          ]),
    ]);

    // Notification
    await notificationService.create({
      type: 'CHECK_OUT',
      title: 'Guest Checked Out',
      message: `${reservation.guest.name} checked out of Room ${reservation.room.roomNumber}`,
      userId,
    });

    return updated;
  }

  async cancel(id: string, userId: string) {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { room: true, guest: true },
    });

    if (!reservation) throw Object.assign(new Error('Reservation not found'), { statusCode: 404 });
    if (['CHECKED_OUT', 'CANCELLED'].includes(reservation.status)) {
      throw Object.assign(new Error('Reservation is already completed or cancelled'), { statusCode: 400 });
    }

    const [updated] = await prisma.$transaction([
      prisma.reservation.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: { room: { include: { roomType: true } }, guest: true },
      }),
      prisma.room.update({
        where: { id: reservation.roomId },
        data: { status: 'AVAILABLE' },
      }),
    ]);

    // Notification
    await notificationService.create({
      type: 'CANCEL',
      title: 'Reservation Cancelled',
      message: `Reservation for ${reservation.guest.name} in Room ${reservation.room.roomNumber} was cancelled`,
      userId,
    });

    return updated;
  }

  async shiftRoom(reservationId: string, newRoomId: string, userId: string) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { room: true, guest: true },
    });

    if (!reservation) throw Object.assign(new Error('Reservation not found'), { statusCode: 404 });
    if (reservation.status !== 'CHECKED_IN') {
      throw Object.assign(new Error('Only checked-in reservations can be shifted'), { statusCode: 400 });
    }

    const newRoom = await prisma.room.findUnique({ where: { id: newRoomId } });
    if (!newRoom) throw Object.assign(new Error('New room not found'), { statusCode: 404 });
    if (newRoom.status !== 'AVAILABLE') {
      throw Object.assign(new Error('New room is not available'), { statusCode: 400 });
    }

    const oldRoomNumber = reservation.room.roomNumber;

    const [updated] = await prisma.$transaction([
      prisma.reservation.update({
        where: { id: reservationId },
        data: { roomId: newRoomId },
        include: { room: { include: { roomType: true } }, guest: true },
      }),
      prisma.room.update({
        where: { id: reservation.roomId },
        data: { status: 'AVAILABLE' },
      }),
      prisma.room.update({
        where: { id: newRoomId },
        data: { status: 'OCCUPIED' },
      }),
    ]);

    // Notification
    await notificationService.create({
      type: 'ROOM_SHIFT',
      title: 'Room Shifted',
      message: `${reservation.guest.name} moved from Room ${oldRoomNumber} to Room ${newRoom.roomNumber}`,
      userId,
    });

    return updated;
  }

  // ─── Helpers ─────────────────────────────────────────

  private async checkRoomAvailability(
    roomId: string,
    checkIn: Date,
    checkOut: Date,
    excludeReservationId?: string
  ) {
    const where: any = {
      roomId,
      status: { in: ['CONFIRMED', 'CHECKED_IN'] },
      checkInDate: { lt: checkOut },
      checkOutDate: { gt: checkIn },
    };

    if (excludeReservationId) {
      where.id = { not: excludeReservationId };
    }

    return prisma.reservation.findFirst({ where });
  }
}

export const reservationService = new ReservationService();
