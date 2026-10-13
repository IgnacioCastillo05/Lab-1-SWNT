export type EmissionCategory = 'Transporte' | 'Energía' | 'Residuos';

export const EMISSION_CATEGORIES: readonly EmissionCategory[] = [
  'Transporte',
  'Energía',
  'Residuos',
];

export const DEFAULT_EMISSION_CATEGORY: EmissionCategory = 'Transporte';

/** Fila tal como vive en la tabla `emissions` de Supabase. */
export interface EmissionRecord {
  id: string;
  source_name: string;
  category: EmissionCategory;
  co2_kg: number;
  created_at: string;
}

/** Datos necesarios para insertar una nueva medición. */
export interface NewEmissionInput {
  source_name: string;
  category: EmissionCategory;
  co2_kg: number;
}
