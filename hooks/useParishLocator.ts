import { useState } from 'react';
import { PARISHES } from '../constants';
import { Parish } from '../types';

export const useParishLocator = () => {
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [detectedParish, setDetectedParish] = useState<Parish | null>(null);
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isManual, setIsManual] = useState(false);

  // AUTO-LOCATION REMOVED: 
  // We strictly rely on manual selection via the UI to avoid permission prompts
  // and ensuring the user explicitly chooses their region.

  const manualOverride = (parishId: string) => {
    const p = PARISHES.find(p => p.id === parishId);
    if (p) {
      setDetectedParish(p);
      setIsManual(true);
      setError(null);
    }
  };

  return { loading, error, detectedParish, manualOverride, isManual, userCoords };
};