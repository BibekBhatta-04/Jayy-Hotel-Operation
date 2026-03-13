export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'RECEPTIONIST';
}

export interface RoomType {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  maxOccupancy: number;
  amenities: string[];
  _count?: { rooms: number };
}

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  status: RoomStatus;
  notes?: string;
  roomTypeId: string;
  roomType: RoomType;
}

export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'MAINTENANCE' | 'DIRTY';

export interface Guest {
  id: string;
  name: string;
  email?: string;
  phone: string;
  idNumber?: string;
  address?: string;
  maritalStatus?: string;
  occupancyType?: string;
  nationality?: string;
  passportNo?: string;
  pax?: number;
  tariff?: number;
  plan?: string;
  contactNo?: string;
  agent?: string;
  notes?: string;
  _count?: { reservations: number };
  reservations?: Reservation[];
}

export type ReservationStatus = 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW';
export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'ONLINE' | 'OTHER';

export interface Reservation {
  id: string;
  roomId: string;
  room: Room;
  guestId: string;
  guest: Guest;
  checkInDate: string;
  checkOutDate: string;
  status: ReservationStatus;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  specialRequests?: string;
  adults: number;
  children: number;
  createdById: string;
  createdBy?: { id: string; name: string };
  createdAt: string;
  invoice?: Invoice;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  reservationId: string;
  reservation?: Reservation;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  arrivalsToday: number;
  departuresToday: number;
  newBookingsToday: number;
  revenueToday: number;
  totalGuests: number;
}

export interface BookingTrend {
  date: string;
  bookings: number;
  revenue: number;
}

export interface RoomStatusCount {
  status: RoomStatus;
  count: number;
}
