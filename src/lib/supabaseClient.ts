import { createClient } from '@supabase/supabase-js';

// Default Supabase project configuration for this setup
// Users can override these dynamically in the UI settings
export const DEFAULT_SUPABASE_URL = 'https://jfnpxkxnkriquvapzniy.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = '';

const STORAGE_KEY_URL = 'pos_supabase_url';
const STORAGE_KEY_ANON = 'pos_supabase_anon_key';

export function getStoredSupabaseConfig() {
  const url = localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_SUPABASE_URL;
  const anonKey = localStorage.getItem(STORAGE_KEY_ANON) || DEFAULT_SUPABASE_ANON_KEY;
  return { url, anonKey };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string) {
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
}

export function createCustomSupabaseClient(url: string, anonKey: string) {
  if (!url || !anonKey) return null;
  try {
    return createClient(url, anonKey);
  } catch (e) {
    console.error('Error creating Supabase client:', e);
    return null;
  }
}
