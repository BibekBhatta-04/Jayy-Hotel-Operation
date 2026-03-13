/// <reference types="node" />
import { PrismaClient, RoomStatus, ReservationStatus, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});
async function main() {
  console.log('Seeding database...');

  // ─── Clean existing data (in correct order for FK constraints) ─────
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.room.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.guest.deleteMany();
  console.log('Cleaned existing data');

  // ─── Users ──────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@jaysuites.com' },
    update: {},
    create: {
      email: 'admin@jaysuites.com',
      password: hashedPassword,
      name: 'Jay Admin',
      role: 'ADMIN',
    },
  });

  const receptionist = await prisma.user.upsert({
    where: { email: 'reception@jaysuites.com' },
    update: {},
    create: {
      email: 'reception@jaysuites.com',
      password: await bcrypt.hash('reception123', 12),
      name: 'Front Desk',
      role: 'RECEPTIONIST',
    },
  });

  console.log('Users seeded');

  // ─── Room Types ─────────────────────────────────────
  const doubleType = await prisma.roomType.create({
    data: {
      name: 'Double',
      description: 'Comfortable double room for 2 adults',
      basePrice: 3500,
      maxOccupancy: 2,
      amenities: ['Wi-Fi', 'TV', 'AC', 'Hot Water', 'Room Service'],
    },
  });

  const twinType = await prisma.roomType.create({
    data: {
      name: 'Twin',
      description: 'Twin-bed room for 2 adults',
      basePrice: 3500,
      maxOccupancy: 2,
      amenities: ['Wi-Fi', 'TV', 'AC', 'Hot Water', 'Room Service'],
    },
  });

  const tripleType = await prisma.roomType.create({
    data: {
      name: 'Triple',
      description: 'Spacious triple room for 3 adults',
      basePrice: 4500,
      maxOccupancy: 3,
      amenities: ['Wi-Fi', 'TV', 'AC', 'Hot Water', 'Room Service', 'Mini Bar'],
    },
  });

  const familyType = await prisma.roomType.create({
    data: {
      name: 'Family',
      description: 'Large family room for 3 adults and 1 child',
      basePrice: 5500,
      maxOccupancy: 4,
      amenities: ['Wi-Fi', 'TV', 'AC', 'Hot Water', 'Room Service', 'Extra Beds', 'Family Friendly'],
    },
  });

  const suiteType = await prisma.roomType.create({
    data: {
      name: 'Suite',
      description: 'Premium suite for 4 adults and 1 child with luxury amenities',
      basePrice: 8500,
      maxOccupancy: 5,
      amenities: ['Wi-Fi', 'TV', 'AC', 'Hot Water', 'Room Service', 'Mini Bar', 'City View', 'Bathtub', 'Lounge Area', 'King Bed'],
    },
  });

  console.log('Room types seeded');

  // ─── Rooms (22 rooms across 6 floors) ───────────────
  const roomsData = [
    // Floor 1
    { roomNumber: '101', floor: 1, roomTypeId: familyType.id,  status: 'AVAILABLE' as RoomStatus },
    { roomNumber: '102', floor: 1, roomTypeId: twinType.id,    status: 'OCCUPIED' as RoomStatus },
    { roomNumber: '103', floor: 1, roomTypeId: doubleType.id,  status: 'AVAILABLE' as RoomStatus },
    { roomNumber: '104', floor: 1, roomTypeId: doubleType.id,  status: 'AVAILABLE' as RoomStatus },
    // Floor 2
    { roomNumber: '201', floor: 2, roomTypeId: familyType.id,  status: 'AVAILABLE' as RoomStatus },
    { roomNumber: '202', floor: 2, roomTypeId: twinType.id,    status: 'RESERVED' as RoomStatus },
    { roomNumber: '203', floor: 2, roomTypeId: doubleType.id,  status: 'AVAILABLE' as RoomStatus },
    { roomNumber: '204', floor: 2, roomTypeId: doubleType.id,  status: 'OCCUPIED' as RoomStatus },
    // Floor 3
    { roomNumber: '301', floor: 3, roomTypeId: familyType.id,  status: 'AVAILABLE' as RoomStatus },
    { roomNumber: '302', floor: 3, roomTypeId: twinType.id,    status: 'CLEANING' as RoomStatus },
    { roomNumber: '303', floor: 3, roomTypeId: doubleType.id,  status: 'AVAILABLE' as RoomStatus },
    { roomNumber: '304', floor: 3, roomTypeId: twinType.id,    status: 'AVAILABLE' as RoomStatus },
    // Floor 4
    { roomNumber: '401', floor: 4, roomTypeId: tripleType.id,  status: 'AVAILABLE' as RoomStatus },
    { roomNumber: '402', floor: 4, roomTypeId: twinType.id,    status: 'AVAILABLE' as RoomStatus },
    { roomNumber: '403', floor: 4, roomTypeId: doubleType.id,  status: 'MAINTENANCE' as RoomStatus },
    { roomNumber: '404', floor: 4, roomTypeId: doubleType.id,  status: 'AVAILABLE' as RoomStatus },
    // Floor 5
    { roomNumber: '501', floor: 5, roomTypeId: tripleType.id,  status: 'AVAILABLE' as RoomStatus },
    { roomNumber: '502', floor: 5, roomTypeId: twinType.id,    status: 'AVAILABLE' as RoomStatus },
    { roomNumber: '503', floor: 5, roomTypeId: doubleType.id,  status: 'AVAILABLE' as RoomStatus },
    { roomNumber: '504', floor: 5, roomTypeId: doubleType.id,  status: 'AVAILABLE' as RoomStatus },
    // Floor 6
    { roomNumber: '601', floor: 6, roomTypeId: suiteType.id,   status: 'AVAILABLE' as RoomStatus },
    { roomNumber: '603', floor: 6, roomTypeId: doubleType.id,  status: 'AVAILABLE' as RoomStatus },
  ];

  const rooms = [];
  for (const roomData of roomsData) {
    const room = await prisma.room.create({ data: roomData });
    rooms.push(room);
  }

  console.log('Rooms seeded (22 rooms across 6 floors)');

  // ─── Guests ─────────────────────────────────────────
  const guestsData = [
    { name: 'Rajesh Sharma', email: 'rajesh.sharma@email.com', phone: '+977-9841234567', idNumber: 'NP-12345678', address: 'Kathmandu, Nepal', maritalStatus: 'Married', occupancyType: 'Double', nationality: 'Nepali', passportNo: 'NP12345678', pax: 2, plan: 'BB', agent: 'FIT' },
    { name: 'Priya Thapa', email: 'priya.thapa@email.com', phone: '+977-9851234567', idNumber: 'NP-23456789', address: 'Pokhara, Nepal', maritalStatus: 'Single', occupancyType: 'Single', nationality: 'Nepali', passportNo: 'NP23456789', pax: 1, plan: 'EP', agent: 'Phone' },
    { name: 'John Smith', email: 'john.smith@email.com', phone: '+1-5551234567', idNumber: 'US-34567890', address: 'New York, USA', maritalStatus: 'Married', occupancyType: 'Double', nationality: 'American', passportNo: 'US34567890', pax: 2, plan: 'MAP', agent: 'OTA' },
    { name: 'Anita Gurung', email: 'anita.gurung@email.com', phone: '+977-9861234567', idNumber: 'NP-45678901', address: 'Lalitpur, Nepal', maritalStatus: 'Single', occupancyType: 'Single', nationality: 'Nepali', passportNo: 'NP45678901', pax: 1, plan: 'EP', agent: 'FIT' },
    { name: 'David Chen', email: 'david.chen@email.com', phone: '+86-13912345678', idNumber: 'CN-56789012', address: 'Beijing, China', maritalStatus: 'Married', occupancyType: 'Family', nationality: 'Chinese', passportNo: 'CN56789012', pax: 4, plan: 'AP', agent: 'Agency' },
    { name: 'Sita Adhikari', email: 'sita.adhikari@email.com', phone: '+977-9871234567', idNumber: 'NP-67890123', address: 'Bharatpur, Nepal', maritalStatus: 'Single', occupancyType: 'Single', nationality: 'Nepali', passportNo: 'NP67890123', pax: 1, plan: 'EP', agent: 'Whatsapp' },
    { name: 'Michael Brown', email: 'michael.brown@email.com', phone: '+44-7911234567', idNumber: 'UK-78901234', address: 'London, UK', maritalStatus: 'Single', occupancyType: 'Single', nationality: 'British', passportNo: 'UK78901234', pax: 1, plan: 'BB', agent: 'Email' },
    { name: 'Kamala Basnet', email: 'kamala.basnet@email.com', phone: '+977-9881234567', idNumber: 'NP-89012345', address: 'Biratnagar, Nepal', maritalStatus: 'Married', occupancyType: 'Double', nationality: 'Nepali', passportNo: 'NP89012345', pax: 2, plan: 'MAP', agent: 'Phone' },
  ];

  const guests = [];
  for (const guestData of guestsData) {
    const guest = await prisma.guest.create({ data: guestData });
    guests.push(guest);
  }

  console.log('Guests seeded');

  // ─── Reservations ───────────────────────────────────
  const today = new Date();
  const reservationsData = [
    {
      roomId: rooms[1].id, // Room 102 (Occupied, Twin)
      guestId: guests[0].id,
      checkInDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
      checkOutDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
      status: 'CHECKED_IN' as ReservationStatus,
      totalAmount: 10500,
      paymentMethod: 'CREDIT_CARD' as PaymentMethod,
      adults: 2,
      children: 0,
      createdById: admin.id,
    },
    {
      roomId: rooms[5].id, // Room 202 (Reserved, Twin)
      guestId: guests[2].id,
      checkInDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
      checkOutDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4),
      status: 'CONFIRMED' as ReservationStatus,
      totalAmount: 10500,
      paymentMethod: 'ONLINE' as PaymentMethod,
      adults: 2,
      children: 0,
      createdById: receptionist.id,
    },
    {
      roomId: rooms[7].id, // Room 204 (Occupied, Double)
      guestId: guests[4].id,
      checkInDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
      checkOutDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
      status: 'CHECKED_IN' as ReservationStatus,
      totalAmount: 10500,
      paymentMethod: 'CASH' as PaymentMethod,
      adults: 2,
      children: 2,
      createdById: admin.id,
    },
    {
      roomId: rooms[2].id, // Room 103 (Available, Double)
      guestId: guests[1].id,
      checkInDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10),
      checkOutDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
      status: 'CHECKED_OUT' as ReservationStatus,
      totalAmount: 10500,
      paymentMethod: 'CASH' as PaymentMethod,
      adults: 1,
      children: 0,
      createdById: admin.id,
    },
    {
      roomId: rooms[0].id, // Room 101 (Available, Family)
      guestId: guests[5].id,
      checkInDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      checkOutDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
      status: 'CONFIRMED' as ReservationStatus,
      totalAmount: 16500,
      paymentMethod: 'BANK_TRANSFER' as PaymentMethod,
      adults: 3,
      children: 1,
      createdById: receptionist.id,
    },
  ];

  const reservations = [];
  for (const resData of reservationsData) {
    const reservation = await prisma.reservation.create({ data: resData });
    reservations.push(reservation);
  }

  console.log('Reservations seeded');

  // ─── Invoices (for checked-out reservations) ────────
  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-00001',
      reservationId: reservations[3].id,
      subtotal: 10500,
      taxRate: 13,
      taxAmount: 1365,
      totalAmount: 11865,
      paymentStatus: 'PAID',
      paymentMethod: 'CASH',
      paidAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
      items: {
        create: {
          description: 'Room 103 (Double) - 3 night(s)',
          quantity: 3,
          unitPrice: 3500,
          totalPrice: 10500,
        },
      },
    },
  });

  console.log('Invoices seeded');
  console.log('Database seeding completed successfully!');
  console.log('');
  console.log('Login credentials:');
  console.log('  Admin: admin@jaysuites.com / admin123');
  console.log('  Receptionist: reception@jaysuites.com / reception123');
  console.log('');
  console.log('Room layout:');
  console.log('  Floor 1: 101(Family), 102(Twin), 103(Double), 104(Double)');
  console.log('  Floor 2: 201(Family), 202(Twin), 203(Double), 204(Double)');
  console.log('  Floor 3: 301(Family), 302(Twin), 303(Double), 304(Twin)');
  console.log('  Floor 4: 401(Triple), 402(Twin), 403(Double), 404(Double)');
  console.log('  Floor 5: 501(Triple), 502(Twin), 503(Double), 504(Double)');
  console.log('  Floor 6: 601(Suite), 603(Double)');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
