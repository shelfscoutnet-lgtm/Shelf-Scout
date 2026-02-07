import { useState } from 'react';
import { Region } from '../types';
import { useRegions } from './useRegions';

export const useRegionLocator = () => {
  const { regions } = useRegions();
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedRegion, setDetectedRegion] = useState<Region | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isManual, setIsManual] = useState(false);

  // AUTO-LOCATION REMOVED:
  // We strictly rely on manual selection via the UI to avoid permission prompts
  // and ensuring the user explicitly chooses their region.

  const manualOverride = (regionId: string) => {
    const region = regions.find(r => r.id === regionId);
    if (region) {
      setDetectedRegion(region);
      setIsManual(true);
      setError(null);
    }
  };

  return { loading, error, detectedRegion, manualOverride, isManual, userCoords };
};
