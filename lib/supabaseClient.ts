import { createClient } from '@supabase/supabase-js';

// Credentials provided by user
const supabaseUrl = 'https://zwulphqqstyywybeyleu.supabase.co';
const supabaseKey = 'sb_publishable_glmk08IPflG_GCblTIaYjw_jhU8rSVj';

export const supabase = createClient(supabaseUrl, supabaseKey);