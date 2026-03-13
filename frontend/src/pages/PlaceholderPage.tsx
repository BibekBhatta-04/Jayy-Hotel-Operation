import React from 'react';
import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';

const moduleNames: Record<string, string> = {
  '/restaurant': 'Restaurant',
  '/inventory': 'Inventory',
  '/accounting': 'Accounting',
};

export default function PlaceholderPage() {
  const location = useLocation();
  const moduleName = moduleNames[location.pathname] || 'Module';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-20 h-20 rounded-2xl bg-hotel-cream-light flex items-center justify-center mb-6">
        <Construction className="w-10 h-10 text-hotel-gold" />
      </div>
      <h2 className="text-xl font-semibold text-hotel-dark mb-2">{moduleName}</h2>
      <p className="text-hotel-gray text-sm text-center max-w-md">
        This module is currently under development. It will be available in a future update of the Hotel Jay Suites platform.
      </p>
      <div className="mt-6 px-4 py-2 rounded-full bg-hotel-cream-light text-hotel-gold text-xs font-medium">
        Coming Soon
      </div>
    </div>
  );
}
