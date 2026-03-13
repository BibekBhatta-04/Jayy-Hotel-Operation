import React, { useState } from 'react';
import { Plus, Search, X, LogIn, LogOut, Ban } from 'lucide-react';
import { useReservations, useCreateReservation, useCheckIn, useCheckOut, useCancelReservation } from '@/hooks/useReservations';
import { useRooms } from '@/hooks/useRooms';
import { useGuests } from '@/hooks/useGuests';
import { formatDate, formatCurrency, cn, getStatusColor, getStatusLabel } from '@/lib/utils';
import type { ReservationStatus, PaymentMethod } from '@/types';

const STATUSES: ReservationStatus[] = ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW'];

export default function ReservationsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [guestSearch, setGuestSearch] = useState('');
  const [formData, setFormData] = useState({ roomId: '', guestId: '', checkInDate: '', checkOutDate: '', totalAmount: 0, paymentMethod: 'CASH' as PaymentMethod, specialRequests: '', adults: 1, children: 0 });

  const filters: Record<string, string> = {};
  if (statusFilter) filters.status = statusFilter;
  const { data: reservations, isLoading } = useReservations(Object.keys(filters).length > 0 ? filters : undefined);
  const { data: rooms } = useRooms();
  const { data: guests } = useGuests(guestSearch || undefined);
  const createReservation = useCreateReservation();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const cancelReservation = useCancelReservation();

  const availableRooms = rooms?.filter(r => r.status === 'AVAILABLE') || [];

  const handleCreate = async (e: React.FormEvent) => { e.preventDefault(); try { await createReservation.mutateAsync(formData); setShowForm(false); } catch (err: any) { alert(err.response?.data?.error || 'Failed to create reservation'); } };
  const handleCheckIn = async (id: string) => { if (confirm('Check in this guest?')) { try { await checkIn.mutateAsync(id); } catch (err: any) { alert(err.response?.data?.error || 'Check-in failed'); } } };
  const handleCheckOut = async (id: string) => { if (confirm('Check out this guest? An invoice will be generated.')) { try { await checkOut.mutateAsync(id); } catch (err: any) { alert(err.response?.data?.error || 'Check-out failed'); } } };
  const handleCancel = async (id: string) => { if (confirm('Cancel this reservation?')) { try { await cancelReservation.mutateAsync(id); } catch (err: any) { alert(err.response?.data?.error || 'Cancellation failed'); } } };

  const calcTotal = (roomId: string, ci: string, co: string) => {
    const room = rooms?.find(r => r.id === roomId);
    if (room && ci && co) {
      const nights = Math.max(1, Math.ceil((new Date(co).getTime() - new Date(ci).getTime()) / (1000 * 60 * 60 * 24)));
      return Number(room.roomType.basePrice) * nights;
    }
    return 0;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ─── Toolbar ──────────────────────────────────────── */}
      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="page-select">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
          </select>
          {statusFilter && (
            <button onClick={() => setStatusFilter('')} className="btn-ghost"><X className="w-3.5 h-3.5" /> Clear</button>
          )}
          {reservations && <span className="page-count">{reservations.length} reservation{reservations.length !== 1 ? 's' : ''}</span>}
        </div>
        <div className="page-toolbar-right">
          <button onClick={() => { setFormData({ roomId: '', guestId: '', checkInDate: '', checkOutDate: '', totalAmount: 0, paymentMethod: 'CASH', specialRequests: '', adults: 1, children: 0 }); setShowForm(true); }} className="btn-primary">
            <Plus className="w-4 h-4" /> New Reservation
          </button>
        </div>
      </div>

      {/* ─── Reservations Table ────────────────────────────── */}
      <div className="page-table-wrap">
        <div className="page-table-scroll">
          <table className="page-table">
            <thead>
              <tr>
                <th className="page-th">Guest</th>
                <th className="page-th">Room</th>
                <th className="page-th hidden md:table-cell">Check-in</th>
                <th className="page-th hidden md:table-cell">Check-out</th>
                <th className="page-th hidden lg:table-cell">Amount</th>
                <th className="page-th">Status</th>
                <th className="page-th page-th-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => <tr key={i} className="page-tr"><td colSpan={7} className="page-td"><div className="h-8 bg-gray-50 rounded animate-pulse-soft" /></td></tr>)
              ) : reservations?.length === 0 ? (
                <tr><td colSpan={7} className="page-table-empty">No reservations found</td></tr>
              ) : (
                reservations?.map((res) => (
                  <tr key={res.id} className="page-tr">
                    <td className="page-td">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="page-avatar">{res.guest?.name?.charAt(0)}</div>
                        <div>
                          <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-hotel-dark)' }}>{res.guest?.name}</p>
                          <p style={{ fontSize: '12px', color: 'var(--color-hotel-gray)', marginTop: '2px' }}>{res.guest?.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="page-td">
                      <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-hotel-dark)' }}>{res.room?.roomNumber}</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-hotel-gray)', marginTop: '2px' }}>{res.room?.roomType?.name}</p>
                    </td>
                    <td className="page-td page-td-muted hidden md:table-cell">{formatDate(res.checkInDate)}</td>
                    <td className="page-td page-td-muted hidden md:table-cell">{formatDate(res.checkOutDate)}</td>
                    <td className="page-td hidden lg:table-cell" style={{ fontWeight: 600, color: 'var(--color-hotel-gold)' }}>{formatCurrency(Number(res.totalAmount))}</td>
                    <td className="page-td"><span className={cn('page-badge', getStatusColor(res.status))}>{getStatusLabel(res.status)}</span></td>
                    <td className="page-td page-td-right">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        {res.status === 'CONFIRMED' && (
                          <button onClick={() => handleCheckIn(res.id)} title="Check In" className="btn-icon success"><LogIn className="w-4 h-4" /></button>
                        )}
                        {res.status === 'CHECKED_IN' && (
                          <button onClick={() => handleCheckOut(res.id)} title="Check Out" className="btn-icon info"><LogOut className="w-4 h-4" /></button>
                        )}
                        {['CONFIRMED', 'CHECKED_IN'].includes(res.status) && (
                          <button onClick={() => handleCancel(res.id)} title="Cancel" className="btn-icon danger"><Ban className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {reservations && reservations.length > 0 && (
          <div className="page-table-footer">Showing {reservations.length} reservation{reservations.length !== 1 ? 's' : ''}</div>
        )}
      </div>

      {/* ─── New Reservation Modal ─────────────────────────── */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">New Reservation</h3>
              <button onClick={() => setShowForm(false)} className="btn-icon"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Guest *</label>
                <input placeholder="Search guest..." value={guestSearch} onChange={(e) => setGuestSearch(e.target.value)} className="form-input" style={{ marginBottom: '4px' }} />
                {guestSearch && guests && guests.length > 0 && (
                  <div style={{ border: '1px solid #e2dfd8', borderRadius: '10px', maxHeight: '128px', overflowY: 'auto' }}>
                    {guests.map(g => (
                      <button type="button" key={g.id} onClick={() => { setFormData(p => ({ ...p, guestId: g.id })); setGuestSearch(g.name); }}
                        style={{ width: '100%', textAlign: 'left', padding: '8px 14px', fontSize: '13px', border: 'none', cursor: 'pointer', background: formData.guestId === g.id ? '#f7f5f2' : 'transparent', fontWeight: formData.guestId === g.id ? 600 : 400, fontFamily: 'inherit' }}>
                        {g.name} — {g.phone}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="form-label">Room *</label>
                <select value={formData.roomId} onChange={(e) => { const rid = e.target.value; setFormData(p => ({ ...p, roomId: rid, totalAmount: calcTotal(rid, p.checkInDate, p.checkOutDate) })); }} className="form-select" required>
                  <option value="">Select available room</option>
                  {availableRooms.map(r => <option key={r.id} value={r.id}>Room {r.roomNumber} ({r.roomType.name}) — {formatCurrency(Number(r.roomType.basePrice))}/night</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label className="form-label">Check-in *</label><input type="date" value={formData.checkInDate} onChange={(e) => { const v = e.target.value; setFormData(p => ({ ...p, checkInDate: v, totalAmount: calcTotal(p.roomId, v, p.checkOutDate) })); }} className="form-input" required /></div>
                <div><label className="form-label">Check-out *</label><input type="date" value={formData.checkOutDate} onChange={(e) => { const v = e.target.value; setFormData(p => ({ ...p, checkOutDate: v, totalAmount: calcTotal(p.roomId, p.checkInDate, v) })); }} className="form-input" required /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div><label className="form-label">Adults</label><input type="number" min={1} value={formData.adults} onChange={(e) => setFormData(p => ({ ...p, adults: parseInt(e.target.value) }))} className="form-input" /></div>
                <div><label className="form-label">Children</label><input type="number" min={0} value={formData.children} onChange={(e) => setFormData(p => ({ ...p, children: parseInt(e.target.value) }))} className="form-input" /></div>
                <div><label className="form-label">Payment</label><select value={formData.paymentMethod} onChange={(e) => setFormData(p => ({ ...p, paymentMethod: e.target.value as PaymentMethod }))} className="form-select"><option value="CASH">Cash</option><option value="CREDIT_CARD">Credit Card</option><option value="DEBIT_CARD">Debit Card</option><option value="BANK_TRANSFER">Bank Transfer</option><option value="ONLINE">Online</option></select></div>
              </div>
              <div>
                <label className="form-label">Total Amount</label>
                <input type="number" step="0.01" value={formData.totalAmount} onChange={(e) => setFormData(p => ({ ...p, totalAmount: parseFloat(e.target.value) }))} className="form-input" style={{ fontWeight: 600, color: 'var(--color-hotel-gold)' }} />
              </div>
              <div><label className="form-label">Special Requests</label><textarea value={formData.specialRequests} onChange={(e) => setFormData(p => ({ ...p, specialRequests: e.target.value }))} className="form-textarea" rows={2} /></div>
              <button type="submit" disabled={createReservation.isPending} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {createReservation.isPending ? 'Creating...' : 'Create Reservation'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
