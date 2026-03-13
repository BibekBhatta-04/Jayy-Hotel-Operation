import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Invoice } from '@/types';

export function useInvoices(filters?: Record<string, string>) {
  const params = new URLSearchParams(filters);
  return useQuery<Invoice[]>({
    queryKey: ['invoices', filters],
    queryFn: async () => (await api.get(`/invoices?${params}`)).data,
  });
}

export function useInvoice(id: string) {
  return useQuery<Invoice>({
    queryKey: ['invoices', id],
    queryFn: async () => (await api.get(`/invoices/${id}`)).data,
    enabled: !!id,
  });
}

export function useUpdatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => (await api.put(`/invoices/${id}/payment`, data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useAddInvoiceItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => (await api.post(`/invoices/${id}/items`, data)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}
