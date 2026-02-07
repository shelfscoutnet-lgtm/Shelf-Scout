import { Country, Product, Region, Store } from './types';

export const COUNTRIES: Country[] = [
  { id: 'jm', name: 'Jamaica', code: 'JM', currency: 'JMD' }
];

export const REGIONS: Region[] = [
  // COMBINED KSA REGION (ACTIVE - SIMULATED)
  { id: 'jm-ksa', name: 'Kingston & St. Andrew', slug: 'ksa', countryId: 'jm', coords: { lat: 18.0179, lng: -76.8099 }, tier: 'active', waitlistCount: 0, launchReadiness: 100 },
  
  // ST. CATHERINE (ACTIVE - LIVE)
  { id: 'jm-03', name: 'St. Catherine', slug: 'st-catherine', countryId: 'jm', coords: { lat: 18.0059, lng: -77.0040 }, tier: 'active', waitlistCount: 0, launchReadiness: 100 },
  
  // WAITLIST REGIONS (SENSING)
  { id: 'jm-04', name: 'Clarendon', slug: 'clarendon', countryId: 'jm', coords: { lat: 17.9947, lng: -77.2280 }, tier: 'sensing', waitlistCount: 0, launchReadiness: 5 },
  { id: 'jm-05', name: 'Manchester', slug: 'manchester', countryId: 'jm', coords: { lat: 18.0517, lng: -77.5156 }, tier: 'sensing', waitlistCount: 0, launchReadiness: 2 },
  { id: 'jm-06', name: 'St. Elizabeth', slug: 'st-elizabeth', countryId: 'jm', coords: { lat: 18.0792, lng: -77.7289 }, tier: 'sensing', waitlistCount: 0, launchReadiness: 0 },
  { id: 'jm-07', name: 'Westmoreland', slug: 'westmoreland', countryId: 'jm', coords: { lat: 18.2568, lng: -78.1360 }, tier: 'sensing', waitlistCount: 0, launchReadiness: 0 },
  { id: 'jm-08', name: 'Hanover', slug: 'hanover', countryId: 'jm', coords: { lat: 18.4239, lng: -78.1469 }, tier: 'sensing', waitlistCount: 0, launchReadiness: 0 },
  { id: 'jm-09', name: 'St. James', slug: 'st-james', countryId: 'jm', coords: { lat: 18.3897, lng: -77.8680 }, tier: 'sensing', waitlistCount: 0, launchReadiness: 8 },
  { id: 'jm-10', name: 'Trelawny', slug: 'trelawny', countryId: 'jm', coords: { lat: 18.3695, lng: -77.6258 }, tier: 'sensing', waitlistCount: 0, launchReadiness: 0 },
  { id: 'jm-11', name: 'St. Ann', slug: 'st-ann', countryId: 'jm', coords: { lat: 18.3653, lng: -77.2343 }, tier: 'sensing', waitlistCount: 0, launchReadiness: 5 },
  { id: 'jm-12', name: 'St. Mary', slug: 'st-mary', countryId: 'jm', coords: { lat: 18.3079, lng: -76.8929 }, tier: 'sensing', waitlistCount: 0, launchReadiness: 0 },
  { id: 'jm-13', name: 'Portland', slug: 'portland', countryId: 'jm', coords: { lat: 18.1251, lng: -76.4800 }, tier: 'sensing', waitlistCount: 0, launchReadiness: 0 },
  { id: 'jm-14', name: 'St. Thomas', slug: 'st-thomas', countryId: 'jm', coords: { lat: 17.9252, lng: -76.4357 }, tier: 'sensing', waitlistCount: 0, launchReadiness: 0 },
];

// Expanded Store Data to support comparison across key regions
export const STORES: Store[] = [
  // Kingston & St. Andrew (Mapped to jm-ksa)
  { id: 'store_kgn_hilo', name: 'HiLo Manor Park', region_id: 'jm-ksa', chain: 'HiLo', is_premium: true, coords: { lat: 18.042, lng: -76.780 } },
  { id: 'store_kgn_gf', name: 'General Food Liguanea', region_id: 'jm-ksa', chain: 'General Food', is_premium: false, coords: { lat: 18.019, lng: -76.772 } },
  { id: 'store_kgn_sf', name: 'Shoppers Fair Boulevard', region_id: 'jm-ksa', chain: 'Independent', is_premium: false, coords: { lat: 18.031, lng: -76.815 } },
  { id: 'store_kgn_mega', name: 'MegaMart Waterloo', region_id: 'jm-ksa', chain: 'Independent', is_premium: true, coords: { lat: 18.015, lng: -76.790 } },
  
  // St. Catherine
  { id: 'store_stc_hilo', name: 'HiLo Spanish Town', region_id: 'jm-03', chain: 'HiLo', is_premium: false, coords: { lat: 17.995, lng: -76.955 } },
  { id: 'store_stc_prog', name: 'Progressive Portmore', region_id: 'jm-03', chain: 'Progressive', is_premium: false, coords: { lat: 17.968, lng: -76.885 } },
  { id: 'store_stc_shoppers', name: 'Shoppers Fair Portmore', region_id: 'jm-03', chain: 'Independent', is_premium: false, coords: { lat: 17.972, lng: -76.890 } },

  // St. Ann (Sensing)
  { id: 'store_ann_prog', name: 'Progressive Ocho Rios', region_id: 'jm-11', chain: 'Progressive', is_premium: true, coords: { lat: 18.407, lng: -77.103 } },
  { id: 'store_ann_gen', name: 'General Food Ocho Rios', region_id: 'jm-11', chain: 'General Food', is_premium: false, coords: { lat: 18.409, lng: -77.105 } },

  // St. James (Sensing)
  { id: 'store_james_hilo', name: 'HiLo Fairview', region_id: 'jm-09', chain: 'HiLo', is_premium: true, coords: { lat: 18.463, lng: -77.932 } },
  { id: 'store_james_west', name: 'West Lloyd Grocery', region_id: 'jm-09', chain: 'Independent', is_premium: false, coords: { lat: 18.471, lng: -77.920 } },
];

export const PRODUCTS: Product[] = [
  {
    id: 'prod_oxtail',
    name: 'Fresh Oxtail',
    brand: 'Local',
    category: 'Meat',
    unit: 'per lb',
    tags: ['sunday-dinner', 'fresh'],
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400',
    prices: {
      'store_kgn_hilo': 1350.00,
      'store_kgn_gf': 1200.00,
      'store_kgn_sf': 1150.00,
      'store_kgn_mega': 1400.00,
      'store_stc_hilo': 980.00,
      'store_stc_prog': 1050.00,
      'store_stc_shoppers': 1100.00,
      'store_ann_prog': 1300.00,
      'store_ann_gen': 1180.00,
      'store_james_hilo': 1450.00,
      'store_james_west': 1100.00
    }
  },
  {
    id: 'prod_goat',
    name: 'Goat Meat (Mutton)',
    brand: 'Local',
    category: 'Meat',
    unit: 'per lb',
    tags: ['sunday-dinner', 'curry-goat'],
    image_url: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?auto=format&fit=crop&q=80&w=400',
    prices: {
      'store_kgn_hilo': 1550.00,
      'store_kgn_gf': 1450.00,
      'store_kgn_sf': 1400.00,
      'store_kgn_mega': 1600.00,
      'store_stc_hilo': 1300.00,
      'store_stc_prog': 1350.00,
      'store_stc_shoppers': 1300.00,
      'store_ann_prog': 1500.00,
      'store_ann_gen': 1400.00,
      'store_james_hilo': 1650.00,
      'store_james_west': 1450.00
    }
  },
  {
    id: 'prod_curry',
    name: 'Betapac Curry Powder',
    brand: 'Betapac',
    category: 'Pantry',
    unit: '110g',
    tags: ['spice', 'curry-goat'],
    image_url: 'https://i.ibb.co/6rW8pX9/curry.jpg', // Placeholder logic, real url needed or generic spice
    prices: {
      'store_kgn_hilo': 350.00,
      'store_kgn_gf': 320.00,
      'store_kgn_sf': 300.00,
      'store_kgn_mega': 360.00,
      'store_stc_hilo': 280.00,
      'store_stc_prog': 300.00,
      'store_stc_shoppers': 290.00,
      'store_ann_prog': 340.00,
      'store_ann_gen': 320.00,
      'store_james_hilo': 370.00,
      'store_james_west': 310.00
    }
  },
  {
    id: 'prod_ackee',
    name: 'Ackee in Brine',
    brand: 'Linstead Market',
    category: 'Pantry',
    unit: '540g',
    tags: ['breakfast', 'national-dish'],
    image_url: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=400',
    prices: {
      'store_kgn_hilo': 850.00,
      'store_kgn_gf': 800.00,
      'store_kgn_sf': 780.00,
      'store_kgn_mega': 880.00,
      'store_stc_hilo': 750.00,
      'store_stc_prog': 770.00,
      'store_stc_shoppers': 760.00,
      'store_ann_prog': 820.00,
      'store_ann_gen': 790.00,
      'store_james_hilo': 890.00,
      'store_james_west': 800.00
    }
  },
  {
    id: 'prod_saltfish',
    name: 'Salted Codfish',
    brand: 'Norwegian',
    category: 'Meat',
    unit: 'per lb',
    tags: ['breakfast', 'national-dish'],
    image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a3a2749?auto=format&fit=crop&q=80&w=400',
    prices: {
      'store_kgn_hilo': 1100.00,
      'store_kgn_gf': 1050.00,
      'store_kgn_sf': 1000.00,
      'store_kgn_mega': 1150.00,
      'store_stc_hilo': 950.00,
      'store_stc_prog': 980.00,
      'store_stc_shoppers': 960.00,
      'store_ann_prog': 1080.00,
      'store_ann_gen': 1040.00,
      'store_james_hilo': 1120.00,
      'store_james_west': 1020.00
    }
  },
  {
    id: 'prod_crackers',
    name: 'Excelsior Water Crackers',
    brand: 'Excelsior',
    category: 'Pantry',
    unit: 'Packet',
    tags: ['survival', 'staple'],
    image_url: 'https://images.unsplash.com/photo-1590080874088-e64accd60271?auto=format&fit=crop&q=80&w=400',
    prices: {
      'store_kgn_hilo': 250.00,
      'store_kgn_gf': 245.00,
      'store_kgn_sf': 230.00,
      'store_kgn_mega': 255.00,
      'store_stc_hilo': 230.00,
      'store_stc_prog': 240.00,
      'store_stc_shoppers': 225.00,
      'store_ann_prog': 260.00,
      'store_ann_gen': 240.00,
      'store_james_hilo': 265.00,
      'store_james_west': 235.00
    }
  },
  {
    id: 'prod_rice',
    name: 'White Rice',
    brand: 'Generic',
    category: 'Pantry',
    unit: 'per kg',
    tags: ['staple', 'curry-goat'],
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
    prices: {
      'store_kgn_hilo': 200.00,
      'store_kgn_gf': 180.00,
      'store_kgn_sf': 175.00,
      'store_kgn_mega': 210.00,
      'store_stc_hilo': 170.00,
      'store_stc_prog': 185.00,
      'store_stc_shoppers': 165.00,
      'store_ann_prog': 205.00,
      'store_ann_gen': 190.00,
      'store_james_hilo': 210.00,
      'store_james_west': 180.00
    }
  },
  {
    id: 'prod_flour',
    name: 'Counter Flour',
    brand: 'Generic',
    category: 'Pantry',
    unit: 'per lb',
    tags: ['survival', 'national-dish'],
    image_url: 'https://images.unsplash.com/photo-1627485937980-221c88ac04f9?auto=format&fit=crop&q=80&w=400',
    prices: {
      'store_kgn_hilo': 120.00,
      'store_kgn_gf': 90.00,
      'store_kgn_sf': 85.00,
      'store_kgn_mega': 125.00,
      'store_stc_hilo': 85.00,
      'store_stc_prog': 95.00,
      'store_stc_shoppers': 90.00,
      'store_ann_prog': 115.00,
      'store_ann_gen': 95.00,
      'store_james_hilo': 130.00,
      'store_james_west': 95.00
    }
  },
  {
    id: 'prod_yam',
    name: 'Yellow Yam',
    brand: 'Local',
    category: 'Produce',
    unit: 'per lb',
    tags: ['sunday-dinner', 'national-dish'],
    image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400',
    prices: {
      'store_kgn_hilo': 350.00,
      'store_kgn_gf': 280.00,
      'store_kgn_sf': 260.00,
      'store_kgn_mega': 360.00,
      'store_stc_hilo': 200.00,
      'store_stc_prog': 250.00,
      'store_stc_shoppers': 240.00,
      'store_ann_prog': 320.00,
      'store_ann_gen': 300.00,
      'store_james_hilo': 380.00,
      'store_james_west': 280.00
    }
  }
];

export interface MealBundle {
  id: string;
  title: string;
  description: string;
  image: string;
  productIds: string[];
  savingsLabel: string;
}

export const MEAL_BUNDLES: MealBundle[] = [
  {
    id: 'bundle_sunday',
    title: 'Oxtail Sunday Dinner',
    description: 'Everything you need for a proper Oxtail stew with spinners.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400',
    productIds: ['prod_oxtail', 'prod_rice', 'prod_flour', 'prod_yam'],
    savingsLabel: 'Save up to $450'
  },
  {
    id: 'bundle_curry',
    title: 'Curry Goat Feast',
    description: 'Traditional Curry Goat with white rice. A party staple.',
    image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?auto=format&fit=crop&q=80&w=400',
    productIds: ['prod_goat', 'prod_curry', 'prod_rice'],
    savingsLabel: 'Trending'
  },
  {
    id: 'bundle_ackee',
    title: 'Ackee & Saltfish',
    description: 'The National Dish breakfast bundle with boiled dumplings.',
    image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=400',
    productIds: ['prod_ackee', 'prod_saltfish', 'prod_flour', 'prod_yam'],
    savingsLabel: 'National Fav'
  },
  {
    id: 'bundle_hurricane',
    title: 'Hurricane Preparedness',
    description: 'Essentials to keep your pantry stocked for any storm.',
    image: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&q=80&w=400',
    productIds: ['prod_crackers', 'prod_flour', 'prod_rice'],
    savingsLabel: 'Best Value'
  }
];
