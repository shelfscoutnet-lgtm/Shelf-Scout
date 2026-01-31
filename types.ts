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

export interface PriceData {
  val: number;    // The actual price
  gct: string;    // '+gct' or empty
  branch: string; // 'Mega Mart (Portmore)'
}

export interface Product {
  id: string;
  name: string;
  category: string;
  image_url: string;
  unit: string;
  tags: string[];
  // Prices are objects: { val, gct, branch }
  prices: Record<string, PriceData>; 
}

export interface CartItem extends Product {
  quantity: number;
  selectedStoreId?: string;
}
