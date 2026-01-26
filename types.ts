// 1. Core Regional Types
export interface Parish {
  id: string;   // Standardized ID: 'st-catherine'
  name: string; // Display Name: 'St. Catherine'
}

export interface Store {
  id: string;
  name: string;
  parish: string; // Linked to Parish.id
  city: string;   // e.g., 'Portmore'
  location?: string; // Specific area like 'Lot A-E'
}

// 2. The "Precision" Price Object
// This is what was causing your build to fail. 
// We must explicitly define the shape of the data coming from Mega Mart.
export interface PriceData {
  val: number;    // The actual price: 905.00 
  gct: string;    // The tag: '+gct' 
  branch: string; // The specific location: 'Mega Mart - Portmore'
}

// 3. The Universal Product
export interface Product {
  id: string;
  name: string;
  category: string;
  image_url: string;
  unit: string;
  tags: string[];
  // Meticulous Fix: prices is a Record where the key is a Store ID 
  // and the value is our new PriceData object.
  prices: Record<string, PriceData>; 
}

// 4. Cart and State Types
export interface CartItem extends Product {
  quantity: number;
  selectedStoreId?: string;
}

export interface PriceAlert {
  productId: string;
  targetPrice: number;
}
