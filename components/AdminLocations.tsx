import React, { useMemo, useState } from 'react';
import { CheckCircle, Loader2, MapPin, Plus } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAdminAccess } from '../hooks/useAdminAccess';
import { useCountries } from '../hooks/useCountries';
import { useRegions } from '../hooks/useRegions';
import { useTheme } from '../context/ThemeContext';

export const AdminLocations: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { isAdmin, loading: authLoading, error: authError } = useAdminAccess();
  const { countries } = useCountries();
  const { regions } = useRegions();

  const [countryId, setCountryId] = useState('');
  const [regionId, setRegionId] = useState('');
  const [cityName, setCityName] = useState('');
  const [regionName, setRegionName] = useState('');
  const [regionSlug, setRegionSlug] = useState('');
  const [regionLat, setRegionLat] = useState('');
  const [regionLng, setRegionLng] = useState('');
  const [regionTier, setRegionTier] = useState<'active' | 'sensing' | 'dormant'>('sensing');
  const [countryName, setCountryName] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [countryCurrency, setCountryCurrency] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const regionOptions = useMemo(
    () => regions.filter(region => (countryId ? region.countryId === countryId : true)),
    [regions, countryId]
  );

  const handleCreateCountry = async () => {
    if (!countryName || !countryCode || !countryCurrency) {
      setStatus('Please fill in all country fields.');
      return;
    }
    setIsSaving(true);
    const { error } = await supabase.from('countries').insert({
      name: countryName,
      code: countryCode.toUpperCase(),
      currency: countryCurrency.toUpperCase(),
    });
    setIsSaving(false);
    setStatus(error ? error.message : 'Country added successfully.');
  };

  const handleCreateRegion = async () => {
    if (!countryId || !regionName || !regionSlug || !regionLat || !regionLng) {
      setStatus('Please fill in all region fields.');
      return;
    }
    setIsSaving(true);
    const { error } = await supabase.from('regions').insert({
      name: regionName,
      slug: regionSlug,
      country_id: countryId,
      lat: Number(regionLat),
      lng: Number(regionLng),
      tier: regionTier,
      waitlist_count: 0,
      launch_readiness: 0,
    });
    setIsSaving(false);
    setStatus(error ? error.message : 'Region added successfully.');
  };

  const handleCreateCity = async () => {
    if (!regionId || !cityName) {
      setStatus('Please select a region and enter a city name.');
      return;
    }
    setIsSaving(true);
    const { error } = await supabase.from('cities').insert({
      name: cityName,
      region_id: regionId,
    });
    setIsSaving(false);
    setStatus(error ? error.message : 'City added successfully.');
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="animate-spin text-emerald-500" size={24} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-teal-900 border-teal-800 text-teal-200' : 'bg-white border-slate-200 text-slate-600'}`}>
        <p className="font-semibold mb-2">Admin access required</p>
        <p className="text-sm">
          {authError ? authError : 'Sign in with an approved admin email to manage locations.'}
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-3xl p-6 border shadow-sm ${isDarkMode ? 'bg-teal-900 border-teal-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Admin: Locations</h2>
          <p className="text-sm opacity-70">Add countries, regions, and cities without code changes.</p>
        </div>
        <div className="p-2 rounded-full bg-emerald-100 text-emerald-600">
          <MapPin size={20} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <h3 className="font-semibold">Add Country</h3>
          <input
            value={countryName}
            onChange={(e) => setCountryName(e.target.value)}
            placeholder="Country Name"
            className="w-full rounded-xl border px-3 py-2 text-sm bg-transparent"
          />
          <input
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            placeholder="Country Code (e.g. JM)"
            className="w-full rounded-xl border px-3 py-2 text-sm bg-transparent"
          />
          <input
            value={countryCurrency}
            onChange={(e) => setCountryCurrency(e.target.value)}
            placeholder="Currency (e.g. JMD)"
            className="w-full rounded-xl border px-3 py-2 text-sm bg-transparent"
          />
          <button
            onClick={handleCreateCountry}
            disabled={isSaving}
            className="w-full rounded-xl bg-emerald-600 text-white py-2 text-sm font-semibold flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
            Add Country
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Add Region</h3>
          <select
            value={countryId}
            onChange={(e) => setCountryId(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm bg-transparent"
          >
            <option value="">Select Country</option>
            {countries.map(country => (
              <option key={country.id} value={country.id}>{country.name}</option>
            ))}
          </select>
          <input
            value={regionName}
            onChange={(e) => setRegionName(e.target.value)}
            placeholder="Region Name"
            className="w-full rounded-xl border px-3 py-2 text-sm bg-transparent"
          />
          <input
            value={regionSlug}
            onChange={(e) => setRegionSlug(e.target.value)}
            placeholder="Region Slug"
            className="w-full rounded-xl border px-3 py-2 text-sm bg-transparent"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={regionLat}
              onChange={(e) => setRegionLat(e.target.value)}
              placeholder="Lat"
              className="w-full rounded-xl border px-3 py-2 text-sm bg-transparent"
            />
            <input
              value={regionLng}
              onChange={(e) => setRegionLng(e.target.value)}
              placeholder="Lng"
              className="w-full rounded-xl border px-3 py-2 text-sm bg-transparent"
            />
          </div>
          <select
            value={regionTier}
            onChange={(e) => setRegionTier(e.target.value as 'active' | 'sensing' | 'dormant')}
            className="w-full rounded-xl border px-3 py-2 text-sm bg-transparent"
          >
            <option value="active">Active</option>
            <option value="sensing">Sensing</option>
            <option value="dormant">Dormant</option>
          </select>
          <button
            onClick={handleCreateRegion}
            disabled={isSaving}
            className="w-full rounded-xl bg-emerald-600 text-white py-2 text-sm font-semibold flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
            Add Region
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Add City</h3>
          <select
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm bg-transparent"
          >
            <option value="">Select Region</option>
            {regionOptions.map(region => (
              <option key={region.id} value={region.id}>{region.name}</option>
            ))}
          </select>
          <input
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            placeholder="City Name"
            className="w-full rounded-xl border px-3 py-2 text-sm bg-transparent"
          />
          <button
            onClick={handleCreateCity}
            disabled={isSaving}
            className="w-full rounded-xl bg-emerald-600 text-white py-2 text-sm font-semibold flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
            Add City
          </button>
        </div>
      </div>

      {status && (
        <div className="mt-6 flex items-center gap-2 text-sm text-emerald-500">
          <CheckCircle size={14} />
          {status}
        </div>
      )}
    </div>
  );
};
