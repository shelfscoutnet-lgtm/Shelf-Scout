import React from 'react';
import { useShop } from '../context/ShopContext';
import { ActiveDashboard } from './ActiveDashboard';
import { VelvetRopeWaitlist } from './VelvetRopeWaitlist';
import { ParishSelectionScreen } from './ParishSelectionScreen';
import { Loader2 } from 'lucide-react';

export const ParishGuard: React.FC = () => {
  const { currentParish, isLoadingLocation } = useShop();

  if (isLoadingLocation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
        <p className="text-slate-500 font-medium animate-pulse">Initializing Shelf Scout...</p>
      </div>
    );
  }

  // If no parish is selected (Back button pressed or initial load if no default)
  if (!currentParish) {
    return <ParishSelectionScreen />;
  }

  // The Split-Reality Logic
  if (currentParish.tier === 'active') {
    return <ActiveDashboard />;
  } else {
    // Sensing, Beta, or Dormant
    return <VelvetRopeWaitlist parish={currentParish} />;
  }
};