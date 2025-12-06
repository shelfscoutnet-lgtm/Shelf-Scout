import { useState, useEffect, useCallback } from 'react';
import { PARISHES } from '../constants';
import { Parish } from '../types';

// Utility: Haversine Distance
const toRad = (value: number) => (value * Math.PI) / 180;

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const useParishLocator = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detectedParish, setDetectedParish] = useState<Parish | null>(null);
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isManual, setIsManual] = useState(false);

  const detectLocation = useCallback(() => {
    setLoading(true);
    
    // 1. Check for Saved Preference first (Persistence)
    try {
        const savedParishId = localStorage.getItem('shelf_scout_parish');
        if (savedParishId) {
            const saved = PARISHES.find(p => p.id === savedParishId);
            if (saved) {
                setDetectedParish(saved);
                setIsManual(true);
                // Even if manual parish is loaded, try to get real coords silently for sorting
                navigator.geolocation?.getCurrentPosition(
                    (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                    () => {} 
                );
                setLoading(false);
                return; 
            }
        }
    } catch (e) {
        console.error("Error reading location from storage", e);
    }
    
    if (!navigator.geolocation) {
      setError("Geolocation isn't supported on this device. Defaulting to Kingston.");
      setLoading(false);
      setDetectedParish(PARISHES[0]); 
      return;
    }

    // Failsafe: If geolocation hangs (user ignores prompt or weak signal), force default after 6 seconds.
    const failsafeTimeout = setTimeout(() => {
        setLoading(prev => {
            if (prev) {
                console.warn("Geolocation request timed out (failsafe). Defaulting to Kingston.");
                setError("Location check timed out. Defaulting to Kingston.");
                setDetectedParish(PARISHES[0]);
                return false;
            }
            return prev;
        });
    }, 6000);

    const options = {
      enableHighAccuracy: false, // Speed > Precision. We only need Parish level.
      timeout: 5000,
      maximumAge: Infinity // Accept cached positions for speed
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(failsafeTimeout);
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        
        // Sort parishes by distance
        const sortedParishes = [...PARISHES].map((parish) => ({
          ...parish,
          distance: calculateDistance(latitude, longitude, parish.coords.lat, parish.coords.lng),
        })).sort((a, b) => a.distance - b.distance);

        // Set the closest one
        setDetectedParish(sortedParishes[0]);
        setLoading(false);
        setError(null);
      },
      (err) => {
        clearTimeout(failsafeTimeout);
        let friendlyMsg = "We couldn't pinpoint your location.";
        if (err.code === 1) friendlyMsg = "Please allow location access to find nearby deals.";
        else if (err.code === 2) friendlyMsg = "GPS unavailable. Defaulting to Kingston.";
        else if (err.code === 3) friendlyMsg = "Location request timed out. Defaulting to Kingston.";
        
        console.warn('Geolocation error:', err.message);
        setError(friendlyMsg);
        setLoading(false);
        // Default to Kingston on error (Safe State)
        setDetectedParish(PARISHES[0]);
      },
      options
    );
  }, []);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  const manualOverride = (parishId: string) => {
    const p = PARISHES.find(p => p.id === parishId);
    if (p) {
      setDetectedParish(p);
      setIsManual(true);
      // Persist the manual selection
      localStorage.setItem('shelf_scout_parish', parishId);
    }
  };

  return { loading, error, detectedParish, manualOverride, isManual, userCoords };
};