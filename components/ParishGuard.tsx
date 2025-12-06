import React from 'react';
import { useShop } from '../context/ShopContext';
import { ActiveDashboard } from './ActiveDashboard';
import { VelvetRopeWaitlist } from './VelvetRopeWaitlist';
import { Loader2 } from 'lucide-react';

export const ParishGuard: React.FC = () => {
  const { currentParish, isLoadingLocation, manualOverride } = useShop();

  if (isLoadingLocation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
        <p className="text-slate-500 font-medium animate-pulse">Triangulating Parish Location...</p>
        <p className="text-xs text-slate-400 mt-2">Zero-Cost Geolocation Engine</p>
      </div>
    );
  }

  if (!currentParish) {
    // Fallback if something goes wrong, though hook handles default
    return <div className="p-10 text-center">Unable to detect location. Please reload.</div>;
  }

  // The Split-Reality Logic
  if (currentParish.tier === 'active') {
    return <ActiveDashboard />;
  } else {
    // Sensing, Beta, or Dormant
    return <VelvetRopeWaitlist parish={currentParish} manualOverride={manualOverride} />;
  }
};