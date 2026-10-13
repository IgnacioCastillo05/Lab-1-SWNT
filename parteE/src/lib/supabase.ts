import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Falla rápido y explícito en vez de que Supabase lance un error críptico
  // más adelante en medio de una petición de red.
  throw new Error(
    'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Copia .env.example a .env y completa los valores de tu proyecto de Supabase.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
