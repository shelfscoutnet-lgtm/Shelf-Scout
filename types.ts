export interface Parish {
  id: string;   // e.g., 'st-catherine'
  name: string; // e.g., 'St. Catherine'
}

export interface Store {
  id: string;
  name: string;
  parish: string;
  city: string;
  location?: string;
}

// THE NEW STANDARD: This is the object causing the crashes
export interface PriceData {
  val: number;    // Numeric price
  gct: string;    // e.g., '+gct'
  branch: string; // e.g., 'Mega Mart (Portmore)'
}

export interface Product {
  id: string;
  name: string;
  category: string;
  image_url: string;
  unit: string;
  tags: string[];
  // Prices MUST be objects for the app to work now
  prices: Record<string, PriceData>; 
}

export interface CartItem extends Product {
  quantity: number;
  selectedStoreId?: string;
}

export interface PriceAlert {
  productId: string;
  targetPrice: number;
}
