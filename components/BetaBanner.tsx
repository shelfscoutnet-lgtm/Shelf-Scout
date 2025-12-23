import React from 'react';
import { IS_BETA_MODE } from '../config';
import { useShop } from '../context/ShopContext';

export const BetaBanner: React.FC = () => {
  const { currentParish } = useShop();

  // Show simulated banner ONLY if global beta mode is on AND the current parish is KSA
  // St. Catherine (jm-03) is live.
  if (!IS_BETA_MODE) return null;
  if (currentParish?.id !== 'jm-ksa') return null;

  return (
    <div className="bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-bold py-2 px-4 text-center sticky top-0 z-[100] shadow-md flex items-center justify-center border-b border-amber-500/30">
      <span className="mr-2 text-sm">⚠️</span>
      <span className="uppercase tracking-wide">
        Beta Test: Kingston prices are simulated for testing. Do not use for real shopping yet.
      </span>
    </div>
  );
};