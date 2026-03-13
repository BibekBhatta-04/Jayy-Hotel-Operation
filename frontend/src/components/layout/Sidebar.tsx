import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BedDouble, Users, CalendarDays, FileText,
  BarChart3, ChevronDown, Check
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/rooms', icon: BedDouble, label: 'Rooms' },
  { to: '/reservations', icon: CalendarDays, label: 'Reservations' },
  { to: '/guests', icon: Users, label: 'Guests' },
  { to: '/invoices', icon: FileText, label: 'Billing' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

const modules = [
  { id: 'frontdesk', label: 'Front Desk', active: true },
  { id: 'restaurant', label: 'Restaurant', active: false },
  { id: 'inventory', label: 'Inventory', active: false },
  { id: 'accounting', label: 'Accounting', active: false },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const [moduleOpen, setModuleOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState('frontdesk');
  const [moduleMessage, setModuleMessage] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setModuleOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleModuleSelect = (mod: typeof modules[0]) => {
    setModuleOpen(false);
    if (mod.active) {
      setSelectedModule(mod.id);
      setModuleMessage('');
    } else {
      setModuleMessage(`This module is currently under development. It will be available in a future update of the Hotel Jay Suites platform.`);
      setTimeout(() => setModuleMessage(''), 4000);
    }
  };

  const currentModuleLabel = modules.find(m => m.id === selectedModule)?.label || 'Front Desk';

  return (
    <aside className="sidebar">
      {/* ─── Module Switcher ─────────────────────────────── */}
      <div className="sidebar-header" ref={dropdownRef}>
        <div className="sidebar-brand">
          <a href="/" className="sidebar-logo-link" title="Go to Dashboard">
            <img
              src="/jayyysuites.png"
              alt="Jay Suites"
              className="sidebar-logo-img"
            />
          </a>
          <div className="sidebar-brand-text" onClick={() => setModuleOpen(!moduleOpen)}>
            <span className="sidebar-brand-name">Jay Suites</span>
            <span className="sidebar-brand-module">
              {currentModuleLabel}
              <ChevronDown className={`w-3 h-3 transition-transform ${moduleOpen ? 'rotate-180' : ''}`} />
            </span>
          </div>
        </div>

        {/* Module Dropdown */}
        {moduleOpen && (
          <div className="sidebar-module-dropdown">
            {modules.map((mod) => (
              <button
                key={mod.id}
                className={`sidebar-module-item ${selectedModule === mod.id ? 'active' : ''} ${!mod.active ? 'disabled' : ''}`}
                onClick={() => handleModuleSelect(mod)}
              >
                <span>{mod.label}</span>
                {selectedModule === mod.id && <Check className="w-3.5 h-3.5" />}
                {!mod.active && <span className="sidebar-module-badge">Soon</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Module unavailable message */}
      {moduleMessage && (
        <div className="sidebar-module-message">
          {moduleMessage}
        </div>
      )}

      {/* ─── Navigation ──────────────────────────────────── */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">Main</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
            end={item.to === '/'}
          >
            <item.icon className="sidebar-nav-icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ─── Footer ──────────────────────────────────────── */}
      <div className="sidebar-footer">
        <span className="sidebar-version">v1.0</span>
        <span className="sidebar-footer-text">Hotel Jay Suites</span>
      </div>
    </aside>
  );
}
