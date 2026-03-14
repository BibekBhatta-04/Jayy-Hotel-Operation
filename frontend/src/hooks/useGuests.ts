import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Guest } from '@/types';

export function useGuests(search?: string) {
  return useQuery<Guest[]>({
    queryKey: ['guests', search],
    queryFn: async () => (await api.get('/guests', { params: { search } })).data,
  });
}

export function useGuest(id: string) {
  return useQuery<Guest>({
    queryKey: ['guests', id],
    queryFn: async () => (await api.get(`/guests/${id}`)).data,
    enabled: !!id,
  });
}

export function useCreateGuest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => (await api.post('/guests', data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['guests'] }),
  });
}

export function useUpdateGuest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => (await api.put(`/guests/${id}`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['guests'] }),
  });
}

export function useDeleteGuest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/guests/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['guests'] }),
  });
}
