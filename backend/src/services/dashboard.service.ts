import prisma from '../utils/prisma';

export class DashboardService {
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalRooms,
      availableRooms,
      occupiedRooms,
      arrivalsToday,
      departuresToday,
      newBookingsToday,
      revenueToday,
      totalGuests,
    ] = await Promise.all([
      prisma.room.count(),
      prisma.room.count({ where: { status: 'AVAILABLE' } }),
      prisma.room.count({ where: { status: 'OCCUPIED' } }),
      prisma.reservation.count({
        where: {
          checkInDate: { gte: today, lt: tomorrow },
          status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        },
      }),
      prisma.reservation.count({
        where: {
          checkOutDate: { gte: today, lt: tomorrow },
          status: { in: ['CHECKED_IN', 'CHECKED_OUT'] },
        },
      }),
      prisma.reservation.count({
        where: { createdAt: { gte: today, lt: tomorrow } },
      }),
      prisma.invoice.aggregate({
        where: {
          createdAt: { gte: today, lt: tomorrow },
          paymentStatus: 'PAID',
        },
        _sum: { totalAmount: true },
      }),
      prisma.guest.count(),
    ]);

    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    return {
      totalRooms,
      availableRooms,
      occupiedRooms,
      occupancyRate,
      arrivalsToday,
      departuresToday,
      newBookingsToday,
      revenueToday: Number(revenueToday._sum.totalAmount || 0),
      totalGuests,
    };
  }

  async getBookingTrends() {
    const days = 14;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Create an array of the last 14 days
    const dateRanges = Array.from({ length: days }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (days - 1 - i));
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      return { date, nextDay, dateString: date.toISOString().split('T')[0] };
    });

    const results = [];
    
    // Chunk execution to prevent "MaxClientsInSessionMode" Postgres errors
    // We execute 7 days of queries at a time (14 DB calls per chunk)
    const chunkSize = 7;
    for (let i = 0; i < dateRanges.length; i += chunkSize) {
      const chunk = dateRanges.slice(i, i + chunkSize);
      
      const chunkResults = await Promise.all(
        chunk.map(async ({ date, nextDay, dateString }) => {
          const [bookings, revenue] = await Promise.all([
            prisma.reservation.count({
              where: { createdAt: { gte: date, lt: nextDay } },
            }),
            prisma.invoice.aggregate({
              where: {
                createdAt: { gte: date, lt: nextDay },
                paymentStatus: { in: ['PAID', 'PARTIAL'] },
              },
              _sum: { totalAmount: true },
            }),
          ]);
          
          return {
            date: dateString,
            bookings,
            revenue: Number(revenue._sum.totalAmount || 0),
          };
        })
      );
      
      results.push(...chunkResults);
    }

    return results;
  }

  async getRoomStatusOverview() {
    const statuses = await prisma.room.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    return statuses.map((s) => ({
      status: s.status,
      count: s._count.status,
    }));
  }

  async getRecentReservations() {
    return prisma.reservation.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        guest: { select: { id: true, name: true, phone: true } },
        room: { select: { id: true, roomNumber: true, roomType: { select: { name: true } } } },
      },
    });
  }
}

export const dashboardService = new DashboardService();
