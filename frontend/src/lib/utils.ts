import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateShort(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    AVAILABLE: 'bg-hotel-success/10 text-hotel-success border-hotel-success/20',
    OCCUPIED: 'bg-orange-100 text-orange-700 border-orange-200',
    RESERVED: 'bg-hotel-info/10 text-hotel-info border-hotel-info/20',
    OUT_OF_ORDER: 'bg-hotel-danger/10 text-hotel-danger border-hotel-danger/20',
    CONFIRMED: 'bg-hotel-info/10 text-hotel-info border-hotel-info/20',
    CHECKED_IN: 'bg-hotel-success/10 text-hotel-success border-hotel-success/20',
    CHECKED_OUT: 'bg-hotel-gray/10 text-hotel-gray border-hotel-gray/20',
    CANCELLED: 'bg-hotel-danger/10 text-hotel-danger border-hotel-danger/20',
    NO_SHOW: 'bg-red-100 text-red-700 border-red-200',
    PENDING: 'bg-hotel-warning/10 text-hotel-warning border-hotel-warning/20',
    PAID: 'bg-hotel-success/10 text-hotel-success border-hotel-success/20',
    PARTIAL: 'bg-orange-100 text-orange-700 border-orange-200',
    REFUNDED: 'bg-purple-100 text-purple-700 border-purple-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-600 border-gray-200';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    OUT_OF_ORDER: 'Out of Order',
    CHECKED_IN: 'Checked In',
    CHECKED_OUT: 'Checked Out',
    NO_SHOW: 'No Show',
    MOBILE_BANKING: 'Mobile Banking',
  };
  return labels[status] || status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
