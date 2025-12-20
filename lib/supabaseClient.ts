
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration
 * Uses environment variables for production compatibility.
 * Fallbacks provided for local development if keys aren't set.
 */
// Fix: Accessed environment variables through process.env to resolve TypeScript error 'Property env does not exist on type ImportMeta'
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zwulphqqstyywybeyleu.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_glmk08IPflG_GCblTIaYjw_jhU8rSVj';

if (!supabaseUrl || !supabaseKey) {
  console.error("Critical Error: Supabase environment variables are missing. App may fail to load data.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
