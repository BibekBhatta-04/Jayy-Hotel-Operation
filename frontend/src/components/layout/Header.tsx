import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, User, Settings, Edit3, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface HeaderProps {
  title: string;
  onMenuToggle?: () => void;
}

export default function Header({ title, onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          onClick={onMenuToggle}
          className="header-menu-btn"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="header-title">{title}</h2>
      </div>

      <div className="header-right">
        {/* Search */}
        <div className="header-search">
          <Search className="header-search-icon" />
          <input
            type="text"
            placeholder="Search..."
            className="header-search-input"
          />
        </div>

        {/* Notifications */}
        <button className="header-icon-btn">
          <Bell className="w-[18px] h-[18px]" />
          <span className="header-notif-dot" />
        </button>

        {/* Profile */}
        <div className="header-profile-wrap" ref={dropdownRef}>
          <button
            className="header-profile-btn"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="header-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="header-user-info">
              <span className="header-user-name">{user?.name}</span>
              <span className="header-user-role">{user?.role}</span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="header-dropdown">
              <div className="header-dropdown-header">
                <div className="header-dropdown-avatar">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="header-dropdown-name">{user?.name}</p>
                  <p className="header-dropdown-email">{user?.email}</p>
                </div>
              </div>
              <div className="header-dropdown-divider" />
              <button className="header-dropdown-item" onClick={() => setProfileOpen(false)}>
                <User className="w-4 h-4" />
                <span>User Profile</span>
              </button>
              <button className="header-dropdown-item" onClick={() => setProfileOpen(false)}>
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              <button className="header-dropdown-item" onClick={() => setProfileOpen(false)}>
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <div className="header-dropdown-divider" />
              <button
                className="header-dropdown-item danger"
                onClick={() => { setProfileOpen(false); logout(); }}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
