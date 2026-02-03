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

// THE CONTRACT: Price is an object.
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
  // Prices is a dictionary of StoreID -> PriceData
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
