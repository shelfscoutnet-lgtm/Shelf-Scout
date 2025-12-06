import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const InflationTicker: React.FC = () => {
  return (
    <div className="bg-slate-900 text-white text-xs py-2 overflow-hidden whitespace-nowrap relative z-10">
      <div className="animate-marquee inline-block">
        <span className="mx-4 text-emerald-400 font-bold inline-flex items-center">
          <TrendingDown size={14} className="mr-1"/> Oxtail prices down 5% in Spanish Town
        </span>
        <span className="mx-4 text-rose-400 font-bold inline-flex items-center">
          <TrendingUp size={14} className="mr-1"/> Flour up 2% islandwide
        </span>
        <span className="mx-4 text-emerald-400 font-bold inline-flex items-center">
          <TrendingDown size={14} className="mr-1"/> Yellow Yam $200/lb at HiLo St. Cath
        </span>
        <span className="mx-4 text-amber-400 font-bold">
           Inflation Alert: Check updated prices for weekend shopping!
        </span>
      </div>
    </div>
  );
};