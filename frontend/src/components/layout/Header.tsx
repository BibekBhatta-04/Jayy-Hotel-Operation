import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, User, Settings, Edit3, LogOut, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications';

interface HeaderProps {
  title: string;
  onMenuToggle?: () => void;
}

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const TYPE_ICONS: Record<string, string> = {
  RESERVATION: '📋',
  CHECK_IN: '🏨',
  CHECK_OUT: '🚪',
  CANCEL: '❌',
  GUEST: '👤',
  ROOM: '🛏️',
  ROOM_SHIFT: '🔄',
};

export default function Header({ title, onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: notifData } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="app-header">
      <div className="header-left">
        <button onClick={onMenuToggle} className="header-menu-btn">
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="header-title">{title}</h2>
      </div>

      <div className="header-right">
        {/* Search */}
        <div className="header-search">
          <Search className="header-search-icon" />
          <input type="text" placeholder="Search..." className="header-search-input" />
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            className="header-icon-btn"
            onClick={() => setNotifOpen(!notifOpen)}
            style={{ position: 'relative' }}
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: '#EF4444',
                color: 'white',
                fontSize: '10px',
                fontWeight: 700,
                minWidth: '18px',
                height: '18px',
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
                lineHeight: 1,
                border: '2px solid white',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {notifOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '360px',
              maxHeight: '420px',
              background: 'white',
              borderRadius: '14px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 12px 36px rgba(0,0,0,0.12)',
              overflow: 'hidden',
              zIndex: 100,
              animation: 'dropdown-in 0.15s ease-out',
            }}>
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid #f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
                  Notifications
                  {unreadCount > 0 && (
                    <span style={{
                      marginLeft: '8px',
                      background: '#FEF3C7',
                      color: '#92400E',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }}>
                      {unreadCount} new
                    </span>
                  )}
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead.mutate()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#A67E44',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && markAsRead.mutate(n.id)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f9fafb',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        cursor: n.isRead ? 'default' : 'pointer',
                        background: n.isRead ? 'transparent' : '#FFFBEB',
                        transition: 'background 0.15s',
                      }}
                    >
                      <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>
                        {TYPE_ICONS[n.type] || '🔔'}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: '13px',
                          fontWeight: n.isRead ? 500 : 650,
                          color: '#1a1a2e',
                          margin: 0,
                        }}>
                          {n.title}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          margin: '2px 0 0',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {n.message}
                        </p>
                        <p style={{ fontSize: '11px', color: '#9ca3af', margin: '3px 0 0' }}>
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                      {!n.isRead && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '4px',
                          background: '#A67E44',
                          flexShrink: 0,
                          marginTop: '6px',
                        }} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="header-profile-wrap" ref={profileRef}>
          <button className="header-profile-btn" onClick={() => setProfileOpen(!profileOpen)}>
            <div className="header-avatar">{user?.name?.charAt(0) || 'U'}</div>
            <div className="header-user-info">
              <span className="header-user-name">{user?.name}</span>
              <span className="header-user-role">{user?.role}</span>
            </div>
          </button>

          {profileOpen && (
            <div className="header-dropdown">
              <div className="header-dropdown-header">
                <div className="header-dropdown-avatar">{user?.name?.charAt(0) || 'U'}</div>
                <div>
                  <p className="header-dropdown-name">{user?.name}</p>
                  <p className="header-dropdown-email">{user?.email}</p>
                </div>
              </div>
              <div className="header-dropdown-divider" />
              <button className="header-dropdown-item" onClick={() => setProfileOpen(false)}>
                <User className="w-4 h-4" /><span>User Profile</span>
              </button>
              <button className="header-dropdown-item" onClick={() => setProfileOpen(false)}>
                <Edit3 className="w-4 h-4" /><span>Edit Profile</span>
              </button>
              <button className="header-dropdown-item" onClick={() => setProfileOpen(false)}>
                <Settings className="w-4 h-4" /><span>Settings</span>
              </button>
              <div className="header-dropdown-divider" />
              <button className="header-dropdown-item danger" onClick={() => { setProfileOpen(false); logout(); }}>
                <LogOut className="w-4 h-4" /><span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
