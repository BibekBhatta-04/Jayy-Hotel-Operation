import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Room, RoomType } from '@/types';

export function useRooms(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters);
  return useQuery<Room[]>({
    queryKey: ['rooms', filters],
    queryFn: async () => (await api.get(`/rooms?${params}`)).data,
  });
}

export function useRoomTypes() {
  return useQuery<RoomType[]>({
    queryKey: ['roomTypes'],
    queryFn: async () => (await api.get('/rooms/types')).data,
  });
}

export function useCreateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => (await api.post('/rooms', data)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rooms'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); },
  });
}

export function useUpdateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => (await api.put(`/rooms/${id}`, data)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rooms'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); },
  });
}

export function useDeleteRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/rooms/${id}`)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rooms'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); },
  });
}

export function useCreateRoomType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => (await api.post('/rooms/types', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roomTypes'] }),
  });
}

export function useUpdateRoomType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => (await api.put(`/rooms/types/${id}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roomTypes'] }),
  });
}
