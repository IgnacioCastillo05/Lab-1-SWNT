import { useCallback, useEffect, useState } from 'react';

import { supabase } from '../lib/supabase';
import { validateNewProyecto, hasValidationErrors, type ProyectoFormErrors } from '../lib/validators';
import type { NewProyectoInput, ProyectoResumen } from '../types/database';

interface UseProjectsResult {
  projects: ProyectoResumen[];
  loading: boolean;
  error: string | null;
  createProject: (input: NewProyectoInput) => Promise<ProyectoFormErrors>;
}

/**
 * Hook de datos para el Dashboard de EcoFlow. Lee de la vista
 * `proyectos_resumen` (join + agregación de costos ya resuelto en SQL,
 * no en el cliente) y encapsula la validación + inserción de proyectos
 * nuevos. RLS garantiza que solo aparezcan los proyectos del instalador
 * autenticado; este hook no filtra nada por su cuenta.
 */
export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<ProyectoResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('proyectos_resumen')
      .select('*')
      .order('nombre', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setProjects((data ?? []) as ProyectoResumen[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const createProject = useCallback(
    async (input: NewProyectoInput): Promise<ProyectoFormErrors> => {
      const validationErrors = validateNewProyecto(input);
      if (hasValidationErrors(validationErrors)) {
        return validationErrors;
      }

      setError(null);
      const { error: insertError } = await supabase.from('proyectos').insert(input);

      if (insertError) {
        setError(insertError.message);
        return {};
      }

      // Se refetchea en vez de insertar optimistamente en el estado local:
      // el proyecto nuevo depende de la vista agregada (costo_total,
      // cantidad_materiales), y es más simple/correcto pedirle a la base
      // ese cálculo que reproducirlo en el cliente.
      await fetchProjects();
      return {};
    },
    [fetchProjects],
  );

  return { projects, loading, error, createProject };
}
