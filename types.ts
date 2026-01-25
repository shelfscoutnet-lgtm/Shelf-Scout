export interface Parish {
  id: string;
  name: string;
}

export interface Store {
  id: string;
  name: string;
  parish: string;
  city: string;
  location?: string;
}

// METICULOUS FIX: Defines the new format { val, gct, branch } 
// that prevents build failures.
export interface PriceData {
  val: number;
  gct: string;
  branch: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  image_url: string;
  unit: string;
  tags: string[];
  // Prices are now a record of our new PriceData objects
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
