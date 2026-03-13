import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/rooms': 'Room Management',
  '/guests': 'Guest Management',
  '/reservations': 'Reservations',
  '/invoices': 'Billing & Invoices',
  '/analytics': 'Analytics',
  '/restaurant': 'Restaurant',
  '/inventory': 'Inventory',
  '/accounting': 'Accounting',
};

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Hotel Jay Suites';

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar — always visible */}
      <div className="sidebar-desktop">
        <Sidebar />
      </div>

      {/* Mobile sidebar — slide-in */}
      <div className={`sidebar-mobile ${mobileOpen ? 'open' : ''}`}>
        <Sidebar onClose={() => setMobileOpen(false)} />
      </div>

      {/* Main content */}
      <main className="app-main">
        <Header title={title} onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <div className="app-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
