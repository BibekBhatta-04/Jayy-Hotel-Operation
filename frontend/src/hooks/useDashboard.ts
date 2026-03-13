import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { DashboardStats, BookingTrend, RoomStatusCount, Reservation } from '@/types';

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => (await api.get('/dashboard/stats')).data,
    refetchInterval: 30000,
  });
}

export function useBookingTrends() {
  return useQuery<BookingTrend[]>({
    queryKey: ['dashboard', 'trends'],
    queryFn: async () => (await api.get('/dashboard/trends')).data,
  });
}

export function useRoomStatusOverview() {
  return useQuery<RoomStatusCount[]>({
    queryKey: ['dashboard', 'room-status'],
    queryFn: async () => (await api.get('/dashboard/room-status')).data,
  });
}

export function useRecentReservations() {
  return useQuery<Reservation[]>({
    queryKey: ['dashboard', 'recent-reservations'],
    queryFn: async () => (await api.get('/dashboard/recent-reservations')).data,
  });
}
