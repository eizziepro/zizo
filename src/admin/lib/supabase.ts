import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  ((import.meta as any).env?.VITE_SUPABASE_URL as string) ||
  (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL : '') ||
  'https://demo.supabase.co';

const supabaseAnonKey =
  ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) ||
  (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY : '') ||
  'public-anon-key-placeholder';

export const isSupabaseConfigured =
  supabaseUrl !== 'https://demo.supabase.co' &&
  supabaseAnonKey !== 'public-anon-key-placeholder' &&
  Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'zizo_staff_auth_v1',
  },
});
