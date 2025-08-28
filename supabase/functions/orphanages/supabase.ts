import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// This is a helper function to create a Supabase client
export const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
)