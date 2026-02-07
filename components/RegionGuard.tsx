import React from 'react';
import { useShop } from '../context/ShopContext';
import { ActiveDashboard } from '../pages/ActiveDashboard';
import { VelvetRopeWaitlist } from './VelvetRopeWaitlist';
import { RegionSelectionScreen } from './RegionSelectionScreen';
import { Loader2 } from 'lucide-react';

export const RegionGuard: React.FC = () => {
  const { currentRegion, isLoadingLocation } = useShop();

  if (isLoadingLocation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
        <p className="text-slate-500 font-medium animate-pulse">Initializing Shelf Scout...</p>
      </div>
    );
  }

  // If no region is selected (Back button pressed or initial load if no default)
  if (!currentRegion) {
    return <RegionSelectionScreen />;
  }

  // The Split-Reality Logic
  if (currentRegion.tier === 'active') {
    return <ActiveDashboard />;
  }

  // Sensing, Beta, or Dormant
  return <VelvetRopeWaitlist region={currentRegion} />;
};
