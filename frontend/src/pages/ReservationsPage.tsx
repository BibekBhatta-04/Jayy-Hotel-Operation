import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, X, LogIn, LogOut as LogOutIcon, Ban, ArrowRightLeft, Search, UserPlus, Calendar, Filter } from 'lucide-react';
import { useReservations, useCreateReservation, useCheckIn, useCheckOut, useCancelReservation, useShiftRoom } from '@/hooks/useReservations';
import { useRooms } from '@/hooks/useRooms';
import { useGuests, useCreateGuest } from '@/hooks/useGuests';
import { formatDate, formatCurrency, cn, getStatusColor, getStatusLabel } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { COUNTRIES, getDialCode } from '@/lib/countries';
import type { Reservation, Room, Guest, PaymentMethod } from '@/types';

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'ESEWA', label: 'Esewa' },
  { value: 'FONEPAY', label: 'Fone Pay' },
  { value: 'MOBILE_BANKING', label: 'Mobile Banking' },
];

export default function ReservationsPage() {
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [showForm, setShowForm] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState<string | null>(null);
  const [guestSearch, setGuestSearch] = useState('');
  const [selectedGuestId, setSelectedGuestId] = useState('');
  const [guestDropdownOpen, setGuestDropdownOpen] = useState(false);
  const [shiftRoomId, setShiftRoomId] = useState('');

  const [formData, setFormData] = useState({
    roomId: '', guestId: '', checkInDate: '', checkOutDate: '',
    totalAmount: 0, paymentMethod: 'CASH' as PaymentMethod,
    specialRequests: '', adults: 1, children: 0,
  });

  const [guestFormData, setGuestFormData] = useState({
    name: '', email: '', phone: '', idNumber: '', address: '',
    nationality: '', passportNo: '', pax: 1, maleCount: 0, femaleCount: 0,
    occupancyType: 'Single', plan: 'EP', agent: 'FIT', notes: '',
  });

  const filters: Record<string, string> = {};
  if (statusFilter) filters.status = statusFilter;

  const { data: reservations, isLoading } = useReservations(Object.keys(filters).length > 0 ? filters : undefined);
  const { data: rooms } = useRooms();
  const { data: guests } = useGuests(guestSearch || undefined);
  const createReservation = useCreateReservation();
  const createGuest = useCreateGuest();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const cancelReservation = useCancelReservation();
  const shiftRoom = useShiftRoom();

  const availableRooms = useMemo(() => rooms?.filter(r => r.status === 'AVAILABLE') || [], [rooms]);

  // Auto-open form if redirected from Quick Actions
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'checkin') {
      setStatusFilter('CONFIRMED');
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    } else if (action === 'checkout') {
      setStatusFilter('CHECKED_IN');
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  const openCreateForm = () => {
    setFormData({ roomId: '', guestId: '', checkInDate: '', checkOutDate: '', totalAmount: 0, paymentMethod: 'CASH', specialRequests: '', adults: 1, children: 0 });
    setSelectedGuestId('');
    setGuestSearch('');
    setShowForm(true);
  };

  const handleSubmitReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReservation.mutateAsync({ ...formData, guestId: selectedGuestId });
      setShowForm(false);
      addToast({ type: 'success', title: 'Reservation Created', message: 'New reservation has been booked' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.response?.data?.error || 'Failed to create reservation' });
    }
  };

  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const guest = await createGuest.mutateAsync(guestFormData);
      setSelectedGuestId(guest.id);
      setGuestSearch(guestFormData.name);
      setShowGuestModal(false);
      setGuestDropdownOpen(false);
      addToast({ type: 'success', title: 'Guest Created', message: `${guestFormData.name} added and selected` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.response?.data?.error || 'Failed to create guest' });
    }
  };

  const handleGuestNationalityChange = (nationality: string) => {
    const dialCode = getDialCode(nationality);
    setGuestFormData(p => ({
      ...p,
      nationality,
      phone: dialCode ? `${dialCode}-` : p.phone,
    }));
  };

  const handleCheckIn = async (id: string) => {
    try { await checkIn.mutateAsync(id); addToast({ type: 'success', title: 'Checked In', message: 'Guest successfully checked in' }); }
    catch (err: any) { addToast({ type: 'error', title: 'Check-In Failed', message: err.response?.data?.error || 'Failed to check in' }); }
  };

  const handleCheckOut = async (id: string) => {
    try { await checkOut.mutateAsync(id); addToast({ type: 'success', title: 'Checked Out', message: 'Guest successfully checked out. Invoice generated.' }); }
    catch (err: any) { addToast({ type: 'error', title: 'Check-Out Failed', message: err.response?.data?.error || 'Failed to check out' }); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this reservation?')) return;
    try { await cancelReservation.mutateAsync(id); addToast({ type: 'info', title: 'Reservation Cancelled' }); }
    catch (err: any) { addToast({ type: 'error', title: 'Error', message: err.response?.data?.error || 'Failed to cancel' }); }
  };

  const handleShiftRoom = async () => {
    if (!showShiftModal || !shiftRoomId) return;
    try {
      await shiftRoom.mutateAsync({ id: showShiftModal, newRoomId: shiftRoomId });
      setShowShiftModal(null);
      setShiftRoomId('');
      addToast({ type: 'success', title: 'Room Shifted', message: 'Guest moved to new room successfully' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.response?.data?.error || 'Failed to shift room' });
    }
  };

  const selectGuest = (guest: Guest) => {
    setSelectedGuestId(guest.id);
    setGuestSearch(guest.name);
    setGuestDropdownOpen(false);
  };

  const filteredGuests = guests || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ─── Toolbar ────────────────────────────────────────── */}
      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="page-select" style={{ minWidth: '140px' }}>
            <option value="">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="CHECKED_OUT">Checked Out</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          {statusFilter && <button onClick={() => setStatusFilter('')} className="btn-ghost"><X className="w-3.5 h-3.5" /> Clear</button>}
          <span className="page-count">{reservations?.length || 0} reservations</span>
        </div>
        <div className="page-toolbar-right">
          <button onClick={openCreateForm} className="btn-primary"><Plus className="w-4 h-4" /> New Reservation</button>
        </div>
      </div>

      {/* ─── Reservations Table ──────────────────────────────── */}
      <div className="page-table-wrap">
        <div className="page-table-scroll">
          <table className="page-table">
            <thead>
              <tr>
                <th className="page-th">Guest</th>
                <th className="page-th">Room</th>
                <th className="page-th hidden md:table-cell">Check-In</th>
                <th className="page-th hidden md:table-cell">Check-Out</th>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="page-avatar">{res.guest?.name?.charAt(0) || '?'}</div>
                        <div>
                          <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-hotel-dark)' }}>{res.guest?.name}</p>
                          <p style={{ fontSize: '12px', color: 'var(--color-hotel-gray)', marginTop: '2px' }}>{res.adults}A{res.children > 0 ? `, ${res.children}C` : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="page-td">
                      <p style={{ fontSize: '13.5px', fontWeight: 600 }}>{res.room?.roomNumber}</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-hotel-gray)', marginTop: '2px' }}>{res.room?.roomType?.name}</p>
                    </td>
                    <td className="page-td page-td-muted hidden md:table-cell">{formatDate(res.checkInDate)}</td>
                    <td className="page-td page-td-muted hidden md:table-cell">{formatDate(res.checkOutDate)}</td>
                    <td className="page-td hidden lg:table-cell" style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-hotel-gold)' }}>
                      {formatCurrency(res.totalAmount)}
                    </td>
                    <td className="page-td">
                      <span className={cn('page-badge', getStatusColor(res.status))}>{getStatusLabel(res.status)}</span>
                    </td>
                    <td className="page-td page-td-right">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', flexWrap: 'nowrap' }}>
                        {/* Check In */}
                        {res.status === 'CONFIRMED' && (
                          <button onClick={() => handleCheckIn(res.id)} className="btn-icon" title="Check In" disabled={checkIn.isPending} style={{ color: '#10B981' }}>
                            <LogIn className="w-4 h-4" />
                          </button>
                        )}
                        {/* Check Out */}
                        {res.status === 'CHECKED_IN' && (
                          <button onClick={() => handleCheckOut(res.id)} className="btn-icon" title="Check Out" disabled={checkOut.isPending} style={{ color: '#A67E44' }}>
                            <LogOutIcon className="w-4 h-4" />
                          </button>
                        )}
                        {/* Room Shift */}
                        {res.status === 'CHECKED_IN' && (
                          <button onClick={() => { setShowShiftModal(res.id); setShiftRoomId(''); }} className="btn-icon" title="Shift Room" style={{ color: '#3B82F6' }}>
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>
                        )}
                        {/* Cancel */}
                        {['CONFIRMED', 'CHECKED_IN'].includes(res.status) && (
                          <button onClick={() => handleCancel(res.id)} className="btn-icon danger" title="Cancel" disabled={cancelReservation.isPending}>
                            <Ban className="w-4 h-4" />
                          </button>
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

      {/* ────────────────────────────────────────────────────── */}
      {/* ─── ROOM SHIFT MODAL ─────────────────────────────── */}
      {/* ────────────────────────────────────────────────────── */}
      {showShiftModal && (
        <div className="modal-overlay" onClick={() => setShowShiftModal(null)}>
          <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Shift Room</h3>
              <button onClick={() => setShowShiftModal(null)} className="btn-icon"><X className="w-5 h-5" /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13.5px', color: 'var(--color-hotel-gray)' }}>Select a new available room to move the guest to:</p>
              <select value={shiftRoomId} onChange={(e) => setShiftRoomId(e.target.value)} className="form-select">
                <option value="">Select available room</option>
                {availableRooms.map(r => <option key={r.id} value={r.id}>Room {r.roomNumber} ({r.roomType?.name}) – Floor {r.floor}</option>)}
              </select>
              {availableRooms.length === 0 && <p style={{ fontSize: '12px', color: '#EF4444' }}>No available rooms to shift to.</p>}
              <button onClick={handleShiftRoom} disabled={!shiftRoomId || shiftRoom.isPending} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {shiftRoom.isPending ? 'Shifting...' : 'Confirm Room Shift'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────── */}
      {/* ─── NEW RESERVATION FORM ─────────────────────────── */}
      {/* ────────────────────────────────────────────────────── */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">New Reservation</h3>
              <button onClick={() => setShowForm(false)} className="btn-icon"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmitReservation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Guest Search with + button */}
              <div>
                <label className="form-label">Guest *</label>
                <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <Search className="w-4 h-4" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
                    <input
                      value={guestSearch}
                      onChange={(e) => { setGuestSearch(e.target.value); setGuestDropdownOpen(true); if (!e.target.value) setSelectedGuestId(''); }}
                      onFocus={() => setGuestDropdownOpen(true)}
                      placeholder="Search by name..."
                      className="form-input"
                      style={{ paddingLeft: '36px' }}
                    />
                    {/* Guest Dropdown */}
                    {guestDropdownOpen && guestSearch && (
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, right: 0,
                        background: 'white', border: '1px solid #e5e7eb',
                        borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                        maxHeight: '200px', overflowY: 'auto', zIndex: 50, marginTop: '4px',
                      }}>
                        {filteredGuests.length === 0 ? (
                          <p style={{ padding: '12px', fontSize: '13px', color: 'var(--color-hotel-gray)', textAlign: 'center' }}>No guests found</p>
                        ) : (
                          filteredGuests.map(g => (
                            <div
                              key={g.id}
                              onClick={() => selectGuest(g)}
                              style={{
                                padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                                borderBottom: '1px solid #f3f4f6', transition: 'background 0.1s',
                                background: selectedGuestId === g.id ? '#FFFBEB' : 'transparent',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = '#f9f7f4')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = selectedGuestId === g.id ? '#FFFBEB' : 'transparent')}
                            >
                              <div className="page-avatar" style={{ width: '28px', height: '28px', fontSize: '11px' }}>{g.name.charAt(0)}</div>
                              <div>
                                <p style={{ fontSize: '13px', fontWeight: 600 }}>{g.name}</p>
                                <p style={{ fontSize: '11px', color: 'var(--color-hotel-gray)' }}>{g.phone}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGuestModal(true)}
                    style={{
                      width: '42px', height: '42px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #A67E44, #8B6930)',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(166,126,68,0.3)',
                      transition: 'transform 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    title="Add new guest"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
                {selectedGuestId && <p style={{ fontSize: '12px', color: '#10B981', marginTop: '4px' }}>✓ Guest selected: {guestSearch}</p>}
              </div>

              {/* Room */}
              <div>
                <label className="form-label">Room *</label>
                <select value={formData.roomId} onChange={(e) => setFormData(p => ({ ...p, roomId: e.target.value }))} className="form-select" required>
                  <option value="">Select room</option>
                  {availableRooms.map(r => <option key={r.id} value={r.id}>Room {r.roomNumber} ({r.roomType?.name}) – Floor {r.floor}</option>)}
                </select>
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label className="form-label">Check-In Date *</label><input type="date" value={formData.checkInDate} onChange={(e) => setFormData(p => ({ ...p, checkInDate: e.target.value }))} className="form-input" required /></div>
                <div><label className="form-label">Check-Out Date *</label><input type="date" value={formData.checkOutDate} onChange={(e) => setFormData(p => ({ ...p, checkOutDate: e.target.value }))} className="form-input" required /></div>
              </div>

              {/* Amount + Payment */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label className="form-label">Total Amount *</label><input type="number" min={0} step={0.01} value={formData.totalAmount} onChange={(e) => setFormData(p => ({ ...p, totalAmount: parseFloat(e.target.value) || 0 }))} className="form-input" required /></div>
                <div><label className="form-label">Payment Method</label>
                  <select value={formData.paymentMethod} onChange={(e) => setFormData(p => ({ ...p, paymentMethod: e.target.value as PaymentMethod }))} className="form-select">
                    {PAYMENT_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Adults / Children */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label className="form-label">Adults</label><input type="number" min={1} value={formData.adults} onChange={(e) => setFormData(p => ({ ...p, adults: parseInt(e.target.value) || 1 }))} className="form-input" /></div>
                <div><label className="form-label">Children</label><input type="number" min={0} value={formData.children} onChange={(e) => setFormData(p => ({ ...p, children: parseInt(e.target.value) || 0 }))} className="form-input" /></div>
              </div>

              {/* Special Requests */}
              <div><label className="form-label">Special Requests</label><textarea value={formData.specialRequests} onChange={(e) => setFormData(p => ({ ...p, specialRequests: e.target.value }))} className="form-textarea" rows={2} placeholder="Any special requests..." /></div>

              <button type="submit" disabled={createReservation.isPending || !selectedGuestId} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {createReservation.isPending ? 'Creating...' : 'Create Reservation'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────── */}
      {/* ─── ADD GUEST MODAL (within Reservation) ─────────── */}
      {/* ────────────────────────────────────────────────────── */}
      {showGuestModal && (
        <div className="modal-overlay" style={{ zIndex: 60 }} onClick={() => setShowGuestModal(false)}>
          <div className="modal-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Guest</h3>
              <button onClick={() => setShowGuestModal(false)} className="btn-icon"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateGuest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label className="form-label">Full Name *</label><input value={guestFormData.name} onChange={(e) => setGuestFormData(p => ({ ...p, name: e.target.value }))} className="form-input" required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Nationality</label>
                  <select value={guestFormData.nationality} onChange={(e) => handleGuestNationalityChange(e.target.value)} className="form-select">
                    <option value="">Select</option>
                    {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.name} ({c.dialCode})</option>)}
                  </select>
                </div>
                <div><label className="form-label">Passport No</label><input value={guestFormData.passportNo} onChange={(e) => setGuestFormData(p => ({ ...p, passportNo: e.target.value }))} className="form-input" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label className="form-label">Contact Number *</label><input value={guestFormData.phone} onChange={(e) => setGuestFormData(p => ({ ...p, phone: e.target.value }))} className="form-input" required placeholder="+977-98XXXXXXXX" /></div>
                <div><label className="form-label">Email</label><input type="email" value={guestFormData.email} onChange={(e) => setGuestFormData(p => ({ ...p, email: e.target.value }))} className="form-input" /></div>
              </div>
              <div><label className="form-label">Address</label><input value={guestFormData.address} onChange={(e) => setGuestFormData(p => ({ ...p, address: e.target.value }))} className="form-input" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div><label className="form-label">Pax (Total)</label><input type="number" min={1} value={guestFormData.pax} onChange={(e) => setGuestFormData(p => ({ ...p, pax: parseInt(e.target.value) || 1 }))} className="form-input" /></div>
                <div><label className="form-label">Male</label><input type="number" min={0} value={guestFormData.maleCount} onChange={(e) => setGuestFormData(p => ({ ...p, maleCount: parseInt(e.target.value) || 0 }))} className="form-input" /></div>
                <div><label className="form-label">Female</label><input type="number" min={0} value={guestFormData.femaleCount} onChange={(e) => setGuestFormData(p => ({ ...p, femaleCount: parseInt(e.target.value) || 0 }))} className="form-input" /></div>
              </div>
              {guestFormData.maleCount + guestFormData.femaleCount > 0 && guestFormData.maleCount + guestFormData.femaleCount !== guestFormData.pax && (
                <p style={{ fontSize: '12px', color: '#EF4444' }}>⚠ Male + Female should equal Pax</p>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div><label className="form-label">Plan</label><select value={guestFormData.plan} onChange={(e) => setGuestFormData(p => ({ ...p, plan: e.target.value }))} className="form-select"><option value="EP">EP</option><option value="BB">BB</option><option value="MAP">MAP</option><option value="AP">AP</option></select></div>
                <div><label className="form-label">Agent</label><select value={guestFormData.agent} onChange={(e) => setGuestFormData(p => ({ ...p, agent: e.target.value }))} className="form-select"><option value="FIT">FIT</option><option value="Agency">Agency</option><option value="Phone">Phone</option><option value="Email">Email</option><option value="OTA">OTA</option><option value="Whatsapp">Whatsapp</option></select></div>
                <div><label className="form-label">Occupancy</label><select value={guestFormData.occupancyType} onChange={(e) => setGuestFormData(p => ({ ...p, occupancyType: e.target.value }))} className="form-select"><option value="Single">Single</option><option value="Double">Double</option><option value="Family">Family</option><option value="Group">Group</option></select></div>
              </div>
              <div><label className="form-label">Remarks</label><textarea value={guestFormData.notes} onChange={(e) => setGuestFormData(p => ({ ...p, notes: e.target.value }))} className="form-textarea" rows={2} /></div>
              <button type="submit" disabled={createGuest.isPending} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {createGuest.isPending ? 'Saving...' : 'Save & Select Guest'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
