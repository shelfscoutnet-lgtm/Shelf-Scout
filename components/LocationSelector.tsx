import React from 'react';
import { MapPin } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useRegions } from '../hooks/useRegions';

export const LocationSelector: React.FC = () => {
  const { currentRegion, manualOverride } = useShop();
  const { regions } = useRegions();

  if (!currentRegion) return null;

  return (
    <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
      <MapPin size={14} className="text-emerald-600" />
      <select 
        value={currentRegion.id}
        onChange={(e) => manualOverride(e.target.value)}
        className="bg-transparent text-sm font-medium text-emerald-900 focus:outline-none appearance-none pr-4"
      >
        {regions.map(region => (
          <option key={region.id} value={region.id}>
            {region.name} {region.tier === 'sensing' ? '(Locked)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
};
