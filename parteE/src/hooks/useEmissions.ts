import { useCallback, useEffect, useMemo, useState } from 'react';

import { supabase } from '../lib/supabase';
import type { EmissionRecord, NewEmissionInput } from '../types/emissions';

interface UseEmissionsResult {
  emissions: EmissionRecord[];
  loading: boolean;
  error: string | null;
  totalCo2Kg: number;
  addEmission: (input: NewEmissionInput) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook de datos para el Dashboard de Emisiones. Separa toda la lógica de
 * carga/inserción/error de Supabase de la capa de presentación: los
 * componentes que lo consumen nunca importan `supabase` directamente.
 */
export function useEmissions(): UseEmissionsResult {
  const [emissions, setEmissions] = useState<EmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('emissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setEmissions((data ?? []) as EmissionRecord[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchEmissions();
  }, [fetchEmissions]);

  const addEmission = useCallback(
    async (input: NewEmissionInput) => {
      setError(null);

      const { data, error: insertError } = await supabase
        .from('emissions')
        .insert(input)
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return;
      }

      // Inserción optimista en el estado local: evita un round-trip extra
      // de refetch solo para mostrar el registro recién creado.
      setEmissions((previous) => [data as EmissionRecord, ...previous]);
    },
    [],
  );

  // Recalcular el total en cada render sería barato aquí, pero con listas
  // grandes (cientos de mediciones) deja de serlo; useMemo evita recorrer
  // el arreglo completo salvo que `emissions` realmente haya cambiado.
  const totalCo2Kg = useMemo(
    () => emissions.reduce((sum, emission) => sum + emission.co2_kg, 0),
    [emissions],
  );

  return { emissions, loading, error, totalCo2Kg, addEmission, refetch: fetchEmissions };
}
