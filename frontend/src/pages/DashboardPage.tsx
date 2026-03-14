import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogIn, LogOut as LogOutIcon, Percent, DollarSign,
  BedDouble, Users, CalendarDays, TrendingUp, Zap
} from 'lucide-react';
import { useAllDashboardData } from '@/hooks/useDashboard';
import { formatCurrency, formatDate, formatDateShort, getStatusColor, getStatusLabel, cn } from '@/lib/utils';

// Lazy load Recharts since it's a heavy library
const AreaChart = React.lazy(() => import('recharts').then(module => ({ default: module.AreaChart })));
const Area = React.lazy(() => import('recharts').then(module => ({ default: module.Area })));
const BarChart = React.lazy(() => import('recharts').then(module => ({ default: module.BarChart })));
const Bar = React.lazy(() => import('recharts').then(module => ({ default: module.Bar })));
const XAxis = React.lazy(() => import('recharts').then(module => ({ default: module.XAxis })));
const YAxis = React.lazy(() => import('recharts').then(module => ({ default: module.YAxis })));
const CartesianGrid = React.lazy(() => import('recharts').then(module => ({ default: module.CartesianGrid })));
const Tooltip = React.lazy(() => import('recharts').then(module => ({ default: module.Tooltip })));
const ResponsiveContainer = React.lazy(() => import('recharts').then(module => ({ default: module.ResponsiveContainer })));
const PieChart = React.lazy(() => import('recharts').then(module => ({ default: module.PieChart })));
const Pie = React.lazy(() => import('recharts').then(module => ({ default: module.Pie })));
const Cell = React.lazy(() => import('recharts').then(module => ({ default: module.Cell })));

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: '#10B981',
  OCCUPIED: '#F59E0B',
  RESERVED: '#3B82F6',
  OUT_OF_ORDER: '#EF4444',
  DIRTY: '#D97706',
};

const ChartSkeleton = () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
    <div className="animate-pulse flex space-x-4">
      <div className="flex-1 space-y-4 py-1">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useAllDashboardData();
  
  // Destructure for the rest of JSX
  const stats = data?.stats;
  const trends = data?.trends;
  const roomStatus = data?.roomStatus;
  const recentReservations = data?.recentReservations;

  const primaryCards = [
    { label: 'Occupancy Rate', value: isLoading ? '...' : `${stats?.occupancyRate || 0}%`, icon: Percent, tint: 'tint-gold' },
    { label: 'Revenue Today', value: isLoading ? '...' : formatCurrency(stats?.revenueToday || 0), icon: DollarSign, tint: 'tint-green' },
    { label: 'Arrivals Today', value: isLoading ? '...' : stats?.arrivalsToday || 0, icon: LogIn, tint: 'tint-blue' },
    { label: 'Departures Today', value: isLoading ? '...' : stats?.departuresToday || 0, icon: LogOutIcon, tint: 'tint-orange' },
  ];

  const secondaryCards = [
    { label: 'Available Rooms', value: isLoading ? '...' : `${stats?.availableRooms || 0} / ${stats?.totalRooms || 0}`, icon: BedDouble, tint: 'strip-gold', to: '/rooms' },
    { label: 'New Bookings', value: isLoading ? '...' : stats?.newBookingsToday || 0, icon: CalendarDays, tint: 'strip-blue', to: '/reservations' },
    { label: 'Total Guests', value: isLoading ? '...' : stats?.totalGuests || 0, icon: Users, tint: 'strip-emerald', to: '/guests' },
    { label: 'Rooms Occupied', value: isLoading ? '...' : stats?.occupiedRooms || 0, icon: TrendingUp, tint: 'strip-orange', to: '/rooms' },
  ];

  return (
    <div className="dash-page">
      {/* ─── Primary KPI Cards ─────────────────────────── */}
      <div className="dash-kpi-grid">
        {primaryCards.map((card, idx) => (
          <div key={idx} className={`dash-kpi-card ${card.tint}`} style={{ animationDelay: `${idx * 60}ms` }}>
            <div className="dash-kpi-header">
              <span className="dash-kpi-label">{card.label}</span>
              <div className="dash-kpi-icon-wrap">
                <card.icon className="dash-kpi-icon" />
              </div>
            </div>
            <p className="dash-kpi-value">{card.value}</p>
          </div>
        ))}
      </div>

      {/* ─── Quick Actions ─────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '14px',
      }}>
        <button
          onClick={() => navigate('/reservations?action=checkin')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '18px 22px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '14px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'transform 0.15s, box-shadow 0.15s',
            boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.35)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.25)'; }}
        >
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.2)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <LogIn className="w-5 h-5" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>Quick Check-In</div>
            <div style={{ fontSize: '12px', opacity: 0.85 }}>Process a walk-in check-in</div>
          </div>
          <Zap className="w-4 h-4 ml-auto" style={{ opacity: 0.6 }} />
        </button>

        <button
          onClick={() => navigate('/reservations?action=checkout')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '18px 22px',
            background: 'linear-gradient(135deg, #A67E44 0%, #8B6930 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '14px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'transform 0.15s, box-shadow 0.15s',
            boxShadow: '0 4px 14px rgba(166,126,68,0.25)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(166,126,68,0.35)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(166,126,68,0.25)'; }}
        >
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.2)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <LogOutIcon className="w-5 h-5" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>Quick Check-Out</div>
            <div style={{ fontSize: '12px', opacity: 0.85 }}>Settle bill & check out</div>
          </div>
          <Zap className="w-4 h-4 ml-auto" style={{ opacity: 0.6 }} />
        </button>
      </div>

      {/* ─── Secondary Metric Cards (clickable) ────────── */}
      <div className="dash-strip">
        {secondaryCards.map((card, idx) => (
          <div
            key={idx}
            className={`dash-strip-card ${card.tint}`}
            onClick={() => navigate(card.to)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(card.to)}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="dash-strip-icon-wrap">
              <card.icon className="dash-strip-icon" />
            </div>
            <div className="dash-strip-text">
              <span className="dash-strip-value">{card.value}</span>
              <span className="dash-strip-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Charts Row 1 ──────────────────────────────── */}
      <div className="dash-charts-row">
        <div className="dash-chart-card dash-chart-wide">
          <h3 className="dash-card-title">Booking Trends (14 Days)</h3>
          <div className="dash-chart-area">
            {isLoading ? <ChartSkeleton /> : (
              <Suspense fallback={<ChartSkeleton />}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends || []}>
                    <defs>
                      <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A67E44" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#A67E44" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                    <XAxis dataKey="date" tickFormatter={(v) => formatDateShort(v)} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      labelFormatter={(v) => formatDate(v)}
                    />
                    <Area type="monotone" dataKey="bookings" stroke="#A67E44" strokeWidth={2} fill="url(#bookingGrad)" name="Bookings" />
                  </AreaChart>
                </ResponsiveContainer>
              </Suspense>
            )}
          </div>
        </div>

        <div className="dash-chart-card dash-chart-narrow">
          <h3 className="dash-card-title">Room Status</h3>
          <div className="dash-chart-area-sm">
            {isLoading ? <ChartSkeleton /> : (
              <Suspense fallback={<ChartSkeleton />}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roomStatus || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      dataKey="count"
                      nameKey="status"
                      paddingAngle={3}
                    >
                      {(roomStatus || []).map((entry, idx) => (
                        <Cell key={idx} fill={STATUS_COLORS[entry.status] || '#9CA3AF'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      formatter={(value: any, name: any) => [value, getStatusLabel(name)]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Suspense>
            )}
          </div>
          <div className="dash-status-legend">
            {!isLoading && (roomStatus || []).map((s) => (
              <div key={s.status} className="dash-legend-item">
                <div className="dash-legend-dot" style={{ backgroundColor: STATUS_COLORS[s.status] || '#9CA3AF' }} />
                <span className="dash-legend-label">{getStatusLabel(s.status)}</span>
                <span className="dash-legend-count">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Charts Row 2 ──────────────────────────────── */}
      <div className="dash-charts-row-half">
        <div className="dash-chart-card">
          <h3 className="dash-card-title">Revenue Trend</h3>
          <div className="dash-chart-area">
            {isLoading ? <ChartSkeleton /> : (
              <Suspense fallback={<ChartSkeleton />}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                    <XAxis dataKey="date" tickFormatter={(v) => formatDateShort(v)} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      labelFormatter={(v) => formatDate(v)}
                      formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#A67E44" radius={[4, 4, 0, 0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </Suspense>
            )}
          </div>
        </div>

        <div className="dash-chart-card">
          <h3 className="dash-card-title">Recent Reservations</h3>
          <div className="dash-reservations-list">
            {isLoading ? (
              <div style={{ padding: '20px' }}>Loading reservations...</div>
            ) : (
              <>
                {(recentReservations || []).map((res) => (
                  <div key={res.id} className="dash-reservation-item">
                    <div className="dash-reservation-left">
                      <div className="dash-reservation-avatar">
                        {res.guest?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="dash-reservation-name">{res.guest?.name}</p>
                        <p className="dash-reservation-meta">Room {res.room?.roomNumber} &middot; {formatDate(res.checkInDate)}</p>
                      </div>
                    </div>
                    <span className={cn('dash-reservation-badge', getStatusColor(res.status))}>
                      {getStatusLabel(res.status)}
                    </span>
                  </div>
                ))}
                {(!recentReservations || recentReservations.length === 0) && (
                  <p className="dash-empty">No recent reservations</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
