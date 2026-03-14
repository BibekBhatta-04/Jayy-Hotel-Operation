import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { DashboardStats, BookingTrend, RoomStatusCount, Reservation } from '@/types';

export interface DashboardData {
  stats: DashboardStats;
  trends: BookingTrend[];
  roomStatus: RoomStatusCount[];
  recentReservations: Reservation[];
}

export function useAllDashboardData() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard', 'all'],
    queryFn: async () => (await api.get('/dashboard/all')).data,
    refetchInterval: 30000,
  });
}
