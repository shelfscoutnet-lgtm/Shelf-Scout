export type ParishTier = 'active' | 'sensing' | 'beta' | 'dormant';

export interface Parish {
  id: string;
  name: string;
  slug: string;
  coords: { lat: number; lng: number };
  tier: ParishTier;
  waitlistCount?: number;
  launchReadiness?: number; // Percentage 0-100
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  image_url: string;
  unit: string;
  tags: string[];
  barcode?: string; // Added for matching in Admin Upload
  prices: Record<string, number>; // store_id -> price
}

export interface Store {
  id: string;
  name: string;
  location?: string; // Added for real data display
  parish_id: string;
  chain: 'HiLo' | 'Progressive' | 'General Food' | 'Independent' | string;
  is_premium: boolean; // e.g., Manor Park is premium vs Spanish Town
  coords?: { lat: number; lng: number }; // Added for distance sorting
}

export interface CartItem extends Product {
  quantity: number;
  selectedStoreId?: string; // Tracks which store the user chose for this item
}

export interface PriceAlert {
  productId: string;
  targetPrice: number;
}