export interface Parish {
  id: string;
  name: string;
}

export interface Store {
  id: string;
  name: string;
  parish: string; // Standardized ID like 'st-catherine'
  city: string;   // Clean city name like 'Portmore'
  location?: string;
}

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
