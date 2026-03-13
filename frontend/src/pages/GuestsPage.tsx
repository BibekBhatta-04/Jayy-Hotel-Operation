import React, { useState } from 'react';
import { Plus, Search, X, Edit2, Phone, Mail, MapPin, User } from 'lucide-react';
import { useGuests, useCreateGuest, useUpdateGuest } from '@/hooks/useGuests';
import { formatDate, cn, getStatusColor, getStatusLabel } from '@/lib/utils';
import type { Guest } from '@/types';

export default function GuestsPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', idNumber: '', address: '', maritalStatus: '', occupancyType: 'Single', nationality: '', passportNo: '', pax: 1, tariff: 0, plan: 'EP', contactNo: '', agent: 'FIT', notes: '' });

  const { data: guests, isLoading } = useGuests(search || undefined);
  const createGuest = useCreateGuest();
  const updateGuest = useUpdateGuest();

  const openCreate = () => { setEditingGuest(null); setFormData({ name: '', email: '', phone: '', idNumber: '', address: '', maritalStatus: '', occupancyType: 'Single', nationality: '', passportNo: '', pax: 1, tariff: 0, plan: 'EP', contactNo: '', agent: 'FIT', notes: '' }); setShowForm(true); };
  const openEdit = (guest: Guest) => { setEditingGuest(guest); setFormData({ name: guest.name, email: guest.email || '', phone: guest.phone, idNumber: guest.idNumber || '', address: guest.address || '', maritalStatus: guest.maritalStatus || '', occupancyType: guest.occupancyType || 'Single', nationality: guest.nationality || '', passportNo: guest.passportNo || '', pax: guest.pax || 1, tariff: guest.tariff || 0, plan: guest.plan || 'EP', contactNo: guest.contactNo || '', agent: guest.agent || 'FIT', notes: guest.notes || '' }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGuest) {
        await updateGuest.mutateAsync({ id: editingGuest.id, ...formData });
      } else {
        await createGuest.mutateAsync(formData);
      }
      setShowForm(false);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save guest');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ─── Toolbar ──────────────────────────────────────── */}
      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <div className="page-search">
            <Search className="page-search-icon" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, or ID..."
              className="page-search-input"
            />
            {search && (
              <button onClick={() => setSearch('')} className="page-search-clear">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {guests && <span className="page-count">{guests.length} guest{guests.length !== 1 ? 's' : ''}</span>}
        </div>
        <div className="page-toolbar-right">
          <button onClick={openCreate} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Guest
          </button>
        </div>
      </div>

      {/* ─── Guest Table ──────────────────────────────────── */}
      <div className="page-table-wrap">
        <div className="page-table-scroll">
          <table className="page-table">
            <thead>
              <tr>
                <th className="page-th">Guest</th>
                <th className="page-th hidden md:table-cell">Contact</th>
                <th className="page-th hidden lg:table-cell">ID Number</th>
                <th className="page-th hidden lg:table-cell">Type</th>
                <th className="page-th">Stays</th>
                <th className="page-th page-th-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="page-tr"><td colSpan={6} className="page-td"><div className="h-8 bg-gray-50 rounded animate-pulse-soft" /></td></tr>
                ))
              ) : guests?.length === 0 ? (
                <tr><td colSpan={6} className="page-table-empty">No guests found</td></tr>
              ) : (
                guests?.map((guest) => (
                  <tr key={guest.id} className="page-tr" style={{ cursor: 'pointer' }} onClick={() => setSelectedGuest(guest)}>
                    <td className="page-td">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="page-avatar">{guest.name.charAt(0)}</div>
                        <div>
                          <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-hotel-dark)' }}>{guest.name}</p>
                          <p className="md:hidden" style={{ fontSize: '12px', color: 'var(--color-hotel-gray)', marginTop: '2px' }}>{guest.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="page-td hidden md:table-cell">
                      <p style={{ fontSize: '13.5px' }}>{guest.phone}</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-hotel-gray)', marginTop: '2px' }}>{guest.email || '—'}</p>
                    </td>
                    <td className="page-td page-td-muted hidden lg:table-cell">{guest.idNumber || '—'}</td>
                    <td className="page-td page-td-muted hidden lg:table-cell">{guest.occupancyType || '—'}</td>
                    <td className="page-td">
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-hotel-gold)' }}>
                        {(guest as any)._count?.reservations || 0}
                      </span>
                    </td>
                    <td className="page-td page-td-right">
                      <button onClick={(e) => { e.stopPropagation(); openEdit(guest); }} className="btn-icon" title="Edit guest">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {guests && guests.length > 0 && (
          <div className="page-table-footer">Showing {guests.length} guest{guests.length !== 1 ? 's' : ''}</div>
        )}
      </div>

      {/* ─── Guest Detail Drawer ──────────────────────────── */}
      {selectedGuest && selectedGuest.reservations && (
        <div className="drawer-overlay" onClick={() => setSelectedGuest(null)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3 className="modal-title">Guest Profile</h3>
              <button onClick={() => setSelectedGuest(null)} className="btn-icon"><X className="w-5 h-5" /></button>
            </div>
            <div className="drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="page-avatar" style={{ width: '52px', height: '52px', fontSize: '20px', borderRadius: '14px' }}>
                  {selectedGuest.name.charAt(0)}
                </div>
                <div>
                  <p style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-hotel-dark)' }}>{selectedGuest.name}</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-hotel-gray)' }}>{selectedGuest.occupancyType} Guest</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedGuest.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13.5px' }}><Phone className="w-4 h-4" style={{ color: 'var(--color-hotel-gray)' }} /><span>{selectedGuest.phone}</span></div>}
                {selectedGuest.email && <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13.5px' }}><Mail className="w-4 h-4" style={{ color: 'var(--color-hotel-gray)' }} /><span>{selectedGuest.email}</span></div>}
                {selectedGuest.address && <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13.5px' }}><MapPin className="w-4 h-4" style={{ color: 'var(--color-hotel-gray)' }} /><span>{selectedGuest.address}</span></div>}
                {selectedGuest.idNumber && <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13.5px' }}><User className="w-4 h-4" style={{ color: 'var(--color-hotel-gray)' }} /><span>ID: {selectedGuest.idNumber}</span></div>}
              </div>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-hotel-dark)', marginBottom: '12px' }}>Booking History</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedGuest.reservations?.map((res) => (
                    <div key={res.id} style={{ padding: '12px', borderRadius: '10px', background: '#f9f7f4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-hotel-dark)' }}>Room {res.room?.roomNumber}</p>
                        <p style={{ fontSize: '12px', color: 'var(--color-hotel-gray)', marginTop: '2px' }}>{formatDate(res.checkInDate)} — {formatDate(res.checkOutDate)}</p>
                      </div>
                      <span className={cn('page-badge', getStatusColor(res.status))}>{getStatusLabel(res.status)}</span>
                    </div>
                  ))}
                  {(!selectedGuest.reservations || selectedGuest.reservations.length === 0) && <p style={{ fontSize: '13px', color: 'var(--color-hotel-gray)' }}>No booking history</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Guest Form Modal ─────────────────────────────── */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingGuest ? 'Edit Guest' : 'Add Guest'}</h3>
              <button onClick={() => setShowForm(false)} className="btn-icon"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Full Name *</label>
                <input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="form-input" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label className="form-label">Phone *</label><input value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} className="form-input" required /></div>
                <div><label className="form-label">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} className="form-input" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label className="form-label">ID Number</label><input value={formData.idNumber} onChange={(e) => setFormData(p => ({ ...p, idNumber: e.target.value }))} className="form-input" /></div>
                <div><label className="form-label">Marital Status</label><select value={formData.maritalStatus} onChange={(e) => setFormData(p => ({ ...p, maritalStatus: e.target.value }))} className="form-select"><option value="">Select</option><option value="Single">Single</option><option value="Married">Married</option><option value="Other">Other</option></select></div>
              </div>
              <div><label className="form-label">Address</label><input value={formData.address} onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))} className="form-input" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label className="form-label">Nationality</label><input value={formData.nationality} onChange={(e) => setFormData(p => ({ ...p, nationality: e.target.value }))} className="form-input" placeholder="e.g. Nepali" /></div>
                <div><label className="form-label">Passport No</label><input value={formData.passportNo} onChange={(e) => setFormData(p => ({ ...p, passportNo: e.target.value }))} className="form-input" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div><label className="form-label">Pax</label><input type="number" min={1} value={formData.pax} onChange={(e) => setFormData(p => ({ ...p, pax: parseInt(e.target.value) || 1 }))} className="form-input" /></div>
                <div><label className="form-label">Tariff</label><input type="number" step="0.01" min={0} value={formData.tariff} onChange={(e) => setFormData(p => ({ ...p, tariff: parseFloat(e.target.value) || 0 }))} className="form-input" /></div>
                <div><label className="form-label">Plan</label><select value={formData.plan} onChange={(e) => setFormData(p => ({ ...p, plan: e.target.value }))} className="form-select"><option value="EP">EP</option><option value="BB">BB</option><option value="MAP">MAP</option><option value="AP">AP</option></select></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label className="form-label">Contact No</label><input value={formData.contactNo} onChange={(e) => setFormData(p => ({ ...p, contactNo: e.target.value }))} className="form-input" /></div>
                <div><label className="form-label">Agent</label><select value={formData.agent} onChange={(e) => setFormData(p => ({ ...p, agent: e.target.value }))} className="form-select"><option value="FIT">FIT</option><option value="Agency">Agency</option><option value="Phone">Phone</option><option value="Email">Email</option><option value="OTA">OTA</option><option value="Whatsapp">Whatsapp</option></select></div>
              </div>
              <div><label className="form-label">Occupancy Type</label><select value={formData.occupancyType} onChange={(e) => setFormData(p => ({ ...p, occupancyType: e.target.value }))} className="form-select"><option value="Single">Single</option><option value="Double">Double</option><option value="Family">Family</option><option value="Group">Group</option></select></div>
              <div><label className="form-label">Remarks</label><textarea value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} className="form-textarea" rows={2} placeholder="Any special remarks..." /></div>
              <button type="submit" disabled={createGuest.isPending || updateGuest.isPending} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {createGuest.isPending || updateGuest.isPending ? 'Saving...' : editingGuest ? 'Update Guest' : 'Add Guest'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
