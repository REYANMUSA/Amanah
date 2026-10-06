import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from environment or runtime localStorage override
function getSupabaseConfig(): { url: string; key: string } {
  const envUrl = 
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
    '';
  
  const envKey = 
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    '';

  // Check if user set custom credentials in browser settings
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('amanah_supabase_url') || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('amanah_supabase_key') || '' : '';

  const defaultUrl = 'https://umzyvwtvybsccjkxzcpb.supabase.co';
  const defaultKey = 'sb_publishable_SPy-Ygn5Ztu9wyVXk3Jrnw_ighRi0qC';

  const url = (localUrl || envUrl || defaultUrl).trim();
  const key = (localKey || envKey || defaultKey).trim();

  return { url, key };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, key } = getSupabaseConfig();

  // Validate URL format
  if (!url || !key || !url.startsWith('http') || key.length < 10) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (err) {
      console.warn('Could not initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key && url.startsWith('http') && key.length > 20);
}

export function updateSupabaseRuntimeConfig(url: string, key: string) {
  if (typeof window !== 'undefined') {
    if (url && key) {
      localStorage.setItem('amanah_supabase_url', url.trim());
      localStorage.setItem('amanah_supabase_key', key.trim());
    } else {
      localStorage.removeItem('amanah_supabase_url');
      localStorage.removeItem('amanah_supabase_key');
    }
    supabaseInstance = null; // Re-initialize on next call
  }
}

export function getCurrentSupabaseConfig() {
  return getSupabaseConfig();
}
