import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Check that .env.local has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY set.'
  );
}

// Single shared client for the whole app — import this wherever you need
// to talk to Supabase (auth, database queries, etc.) instead of creating
// a new client in every file.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
