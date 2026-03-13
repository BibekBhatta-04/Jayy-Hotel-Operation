import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/lib/auth';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import RoomsPage from '@/pages/RoomsPage';
import GuestsPage from '@/pages/GuestsPage';
import ReservationsPage from '@/pages/ReservationsPage';
import InvoicesPage from '@/pages/InvoicesPage';
import PlaceholderPage from '@/pages/PlaceholderPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EF]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-hotel-gold/20 flex items-center justify-center mx-auto mb-3 animate-pulse-soft">
            <div className="w-6 h-6 rounded bg-hotel-gold" />
          </div>
          <p className="text-sm text-hotel-gray">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="rooms" element={<RoomsPage />} />
              <Route path="guests" element={<GuestsPage />} />
              <Route path="reservations" element={<ReservationsPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="analytics" element={<PlaceholderPage />} />
              <Route path="restaurant" element={<PlaceholderPage />} />
              <Route path="inventory" element={<PlaceholderPage />} />
              <Route path="accounting" element={<PlaceholderPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
