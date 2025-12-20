export interface RecipeDefinition {
  id: string;
  name: string;
  emoji: string;
  keywords: string[];
  image: string;
  description: string;
}

export const RECIPES: RecipeDefinition[] = [
  { 
    id: 'bundle_survival', 
    name: 'Survival Kit', 
    emoji: '🛠️', 
    keywords: ['Corned Beef', 'Crackers'], 
    image: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&q=80&w=400',
    description: 'Essential long-lasting pantry staples.'
  },
  { 
    id: 'bundle_easter', 
    name: 'Easter Preview', 
    emoji: '🧀', 
    keywords: ['Cheese', 'Bun'], 
    image: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?auto=format&fit=crop&q=80&w=400',
    description: 'The iconic holiday pairing.'
  },
  { 
    id: 'bundle_breakfast', 
    name: 'Sunday Breakfast', 
    emoji: '🇯🇲', 
    keywords: ['Mackerel', 'Milk', 'Banana'], 
    image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=400',
    description: 'Hearty island morning fuel.'
  },
  { 
    id: 'bundle_stew', 
    name: 'Sunday Dinner', 
    emoji: '🍗', 
    keywords: ['Chicken', 'Rice', 'Peas'], 
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400',
    description: 'Everything for the perfect weekend feast.'
  }
];