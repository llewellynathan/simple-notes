import { createClient } from '@supabase/supabase-js';

let supabase: ReturnType<typeof createClient>;

try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing environment variables: Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (error) {
  // Provide a mock client for SSR
  supabase = {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ error: null }),
    }),
  } as any;
  
  // Log the error only in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Supabase client initialization error:', error);
  }
}

export { supabase };