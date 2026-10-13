import { useEffect, useState } from 'react';

import { supabase } from '../lib/supabase';

/** Obtiene el id del usuario autenticado actual (el instalador logueado). */
export function useCurrentUserId(): string | null {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  return userId;
}
