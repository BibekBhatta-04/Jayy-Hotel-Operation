import React, { useState } from 'react';
import { Plus, X, Edit2, Trash2, Users, Home, BedDouble, Crown } from 'lucide-react';
import { useRooms, useRoomTypes, useCreateRoom, useUpdateRoom, useDeleteRoom, useCreateRoomType } from '@/hooks/useRooms';
import { cn, getStatusColor, getStatusLabel } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import type { Room, RoomType, RoomStatus } from '@/types';

const ROOM_STATUSES: RoomStatus[] = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'OUT_OF_ORDER'];

const TYPE_META: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  Double:  { icon: <BedDouble className="w-5 h-5" />, color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
  Twin:    { icon: <BedDouble className="w-5 h-5" />, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
  Triple:  { icon: <Users className="w-5 h-5" />,     color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
  Family:  { icon: <Home className="w-5 h-5" />,      color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  Suite:   { icon: <Crown className="w-5 h-5" />,     color: '#A67E44', bg: 'rgba(166,126,68,0.08)' },
};

const OCCUPANCY: Record<string, string> = {
  Double: '2 Adults',
  Twin:   '2 Adults',
  Triple: '3 Adults',
  Family: '3 Adults + 1 Child',
  Suite:  '4 Adults + 1 Child',
};

const STATUS_DOT: Record<string, string> = {
  AVAILABLE:    '#10B981',
  OCCUPIED:     '#F59E0B',
  RESERVED:     '#3B82F6',
  OUT_OF_ORDER: '#EF4444',
};

export default function RoomsPage() {
  const { addToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [floorFilter, setFloorFilter] = useState<string>('');
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({ roomNumber: '', floor: 1, roomTypeId: '', status: 'AVAILABLE' as RoomStatus, notes: '' });
  const [typeFormData, setTypeFormData] = useState({ name: '', description: '', maxOccupancy: 2, amenities: '' });

  const filters: Record<string, string> = {};
  if (statusFilter) filters.status = statusFilter;
  if (floorFilter) filters.floor = floorFilter;

  const { data: rooms, isLoading } = useRooms(Object.keys(filters).length > 0 ? filters : undefined);
  const { data: roomTypes } = useRoomTypes();
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  const createRoomType = useCreateRoomType();

  const openCreate = () => { setEditingRoom(null); setFormData({ roomNumber: '', floor: 1, roomTypeId: roomTypes?.[0]?.id || '', status: 'AVAILABLE', notes: '' }); setShowRoomForm(true); };
  const openEdit = (room: Room) => { setEditingRoom(room); setFormData({ roomNumber: room.roomNumber, floor: room.floor, roomTypeId: room.roomTypeId, status: room.status, notes: room.notes || '' }); setShowRoomForm(true); };

  const handleSubmitRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoom) { await updateRoom.mutateAsync({ id: editingRoom.id, ...formData }); addToast({ type: 'success', title: 'Room Updated', message: `Room ${formData.roomNumber} updated successfully` }); }
      else { await createRoom.mutateAsync(formData); addToast({ type: 'success', title: 'Room Created', message: `Room ${formData.roomNumber} added successfully` }); }
      setShowRoomForm(false);
    } catch (err: any) { addToast({ type: 'error', title: 'Error', message: err.response?.data?.error || 'Failed to save room' }); }
  };

  const handleSubmitType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRoomType.mutateAsync({ ...typeFormData, amenities: typeFormData.amenities.split(',').map(a => a.trim()).filter(Boolean) });
      setShowTypeForm(false);
      setTypeFormData({ name: '', description: '', maxOccupancy: 2, amenities: '' });
      addToast({ type: 'success', title: 'Room Type Created' });
    } catch (err: any) { addToast({ type: 'error', title: 'Error', message: err.response?.data?.error || 'Failed to create room type' }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    try { await deleteRoom.mutateAsync(id); addToast({ type: 'success', title: 'Room Deleted' }); } catch (err: any) { addToast({ type: 'error', title: 'Error', message: err.response?.data?.error || 'Failed to delete room' }); }
  };

  const floors = [...new Set(rooms?.map(r => r.floor) || [])].sort();
  const roomsByFloor = floors.reduce<Record<number, Room[]>>((acc, floor) => {
    acc[floor] = (rooms || []).filter(r => r.floor === floor).sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
    return acc;
  }, {});

  const getMeta = (typeName: string) => TYPE_META[typeName] || TYPE_META['Double'];
  const statusCounts = rooms?.reduce<Record<string, number>>((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {}) || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="page-select">
            <option value="">All Statuses</option>
            {ROOM_STATUSES.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
          </select>
          <select value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)} className="page-select">
            <option value="">All Floors</option>
            {floors.map(f => <option key={f} value={f}>Floor {f}</option>)}
          </select>
          {(statusFilter || floorFilter) && (
            <button onClick={() => { setStatusFilter(''); setFloorFilter(''); }} className="btn-ghost"><X className="w-3.5 h-3.5" /> Clear</button>
          )}
          <span className="page-count">{rooms?.length || 0} rooms</span>
        </div>
        <div className="page-toolbar-right">
          <button onClick={() => setShowTypeForm(true)} className="btn-secondary">Add Room Type</button>
          <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Room</button>
        </div>
      </div>

      {/* Status Legend */}
      <div className="room-status-legend">
        {Object.entries(statusCounts).sort().map(([status, count]) => (
          <div key={status} className="room-legend-item" onClick={() => setStatusFilter(statusFilter === status ? '' : status)} style={{ cursor: 'pointer', opacity: statusFilter && statusFilter !== status ? 0.4 : 1 }}>
            <span className="room-status-dot" style={{ background: STATUS_DOT[status] || '#9CA3AF' }} />
            <span style={{ fontSize: '12px', fontWeight: 500 }}>{getStatusLabel(status)}</span>
            <span style={{ fontSize: '12px', color: 'var(--color-hotel-gray)' }}>({count})</span>
          </div>
        ))}
      </div>

      {/* Floor Sections */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="room-floor-section">
              <div className="room-floor-header"><div className="h-5 w-24 bg-gray-100 rounded animate-pulse-soft" /></div>
              <div className="room-floor-grid">
                {[1, 2, 3, 4].map(j => <div key={j} className="h-36 bg-gray-50 rounded-xl animate-pulse-soft" />)}
              </div>
            </div>
          ))}
        </div>
      ) : floors.length === 0 ? (
        <div className="page-table-wrap" style={{ padding: '48px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: 'var(--color-hotel-gray)' }}>No rooms found. Add rooms to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {floors.map((floor) => (
            <div key={floor} className="room-floor-section">
              <div className="room-floor-header">
                <span className="room-floor-badge">{floor}</span>
                <h3 className="room-floor-title">{floor === 1 ? '1st' : floor === 2 ? '2nd' : floor === 3 ? '3rd' : `${floor}th`} Floor</h3>
                <span className="room-floor-count">{roomsByFloor[floor]?.length || 0} rooms</span>
              </div>
              <div className="room-floor-grid">
                {roomsByFloor[floor]?.map((room, idx) => {
                  const meta = getMeta(room.roomType?.name);
                  const occ = OCCUPANCY[room.roomType?.name] || `${room.roomType?.maxOccupancy || '?'} guests`;
                  return (
                    <div key={room.id} className="room-card" onClick={() => openEdit(room)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && openEdit(room)} style={{ animationDelay: `${idx * 40}ms` }}>
                      <div className="room-card-status" style={{ background: STATUS_DOT[room.status] || '#9CA3AF' }} title={getStatusLabel(room.status)} />
                      <div className="room-card-icon" style={{ background: meta.bg, color: meta.color }}>{meta.icon}</div>
                      <div className="room-card-number">{room.roomNumber}</div>
                      <div className="room-card-type">{room.roomType?.name} Room</div>
                      <div className="room-card-occ"><Users className="w-3 h-3" style={{ opacity: 0.5 }} />{occ}</div>
                      <span className={cn('page-badge', getStatusColor(room.status))} style={{ fontSize: '10px', padding: '2px 8px' }}>
                        {getStatusLabel(room.status)}
                      </span>
                      <div className="room-card-actions">
                        <button onClick={(e) => { e.stopPropagation(); openEdit(room); }} className="btn-icon" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(room.id); }} className="btn-icon danger" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Room Types Summary */}
      {roomTypes && roomTypes.length > 0 && (
        <div className="page-table-wrap" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-hotel-dark)', marginBottom: '16px' }}>Room Types</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {roomTypes.map((type) => {
              const meta = getMeta(type.name);
              return (
                <div key={type.id} style={{ padding: '16px', borderRadius: '12px', background: '#f9f7f4', border: '1px solid #ece9e1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: meta.bg, color: meta.color }}>{meta.icon}</div>
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-hotel-dark)' }}>{type.name}</h4>
                      <p style={{ fontSize: '11px', color: 'var(--color-hotel-gray)' }}>{OCCUPANCY[type.name] || `${type.maxOccupancy} guests`}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-hotel-gray)' }}>{(type as any)._count?.rooms || 0} rooms</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Room Form Modal */}
      {showRoomForm && (
        <div className="modal-overlay" onClick={() => setShowRoomForm(false)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingRoom ? 'Edit Room' : 'Add Room'}</h3>
              <button onClick={() => setShowRoomForm(false)} className="btn-icon"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmitRoom} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><label className="form-label">Room Number</label><input value={formData.roomNumber} onChange={(e) => setFormData(p => ({ ...p, roomNumber: e.target.value }))} className="form-input" required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label className="form-label">Floor</label><input type="number" value={formData.floor} onChange={(e) => setFormData(p => ({ ...p, floor: parseInt(e.target.value) }))} className="form-input" required /></div>
                <div><label className="form-label">Status</label><select value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value as RoomStatus }))} className="form-select">{ROOM_STATUSES.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}</select></div>
              </div>
              <div><label className="form-label">Room Type</label><select value={formData.roomTypeId} onChange={(e) => setFormData(p => ({ ...p, roomTypeId: e.target.value }))} className="form-select" required><option value="">Select room type</option>{roomTypes?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
              <div><label className="form-label">Notes</label><textarea value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} className="form-textarea" rows={2} /></div>
              <button type="submit" disabled={createRoom.isPending || updateRoom.isPending} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {createRoom.isPending || updateRoom.isPending ? 'Saving...' : editingRoom ? 'Update Room' : 'Create Room'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Room Type Form Modal */}
      {showTypeForm && (
        <div className="modal-overlay" onClick={() => setShowTypeForm(false)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Room Type</h3>
              <button onClick={() => setShowTypeForm(false)} className="btn-icon"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmitType} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><label className="form-label">Name</label><input value={typeFormData.name} onChange={(e) => setTypeFormData(p => ({ ...p, name: e.target.value }))} className="form-input" required /></div>
              <div><label className="form-label">Description</label><textarea value={typeFormData.description} onChange={(e) => setTypeFormData(p => ({ ...p, description: e.target.value }))} className="form-textarea" rows={2} /></div>
              <div><label className="form-label">Max Occupancy</label><input type="number" value={typeFormData.maxOccupancy} onChange={(e) => setTypeFormData(p => ({ ...p, maxOccupancy: parseInt(e.target.value) }))} className="form-input" required /></div>
              <div><label className="form-label">Amenities (comma-separated)</label><input value={typeFormData.amenities} onChange={(e) => setTypeFormData(p => ({ ...p, amenities: e.target.value }))} placeholder="Wi-Fi, TV, AC, ..." className="form-input" /></div>
              <button type="submit" disabled={createRoomType.isPending} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {createRoomType.isPending ? 'Creating...' : 'Create Room Type'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
