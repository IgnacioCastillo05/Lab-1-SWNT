import type { NewProyectoInput } from '../types/database';

export type ProyectoFormErrors = Partial<Record<keyof NewProyectoInput, string>>;

/**
 * Validación de formulario reflejando exactamente los CHECK constraints
 * de la base (ver supabase/migrations): la UI nunca debería dejar pasar
 * algo que la base rechazaría, pero la base sigue siendo la autoridad
 * final (defensa en profundidad, no solo validación de cliente).
 */
export function validateNewProyecto(input: Partial<NewProyectoInput>): ProyectoFormErrors {
  const errors: ProyectoFormErrors = {};

  if (!input.nombre || input.nombre.trim().length < 3) {
    errors.nombre = 'El nombre debe tener al menos 3 caracteres.';
  }

  if (!input.direccion || input.direccion.trim().length === 0) {
    errors.direccion = 'La dirección es obligatoria.';
  }

  if (input.potencia_kw === undefined || !Number.isFinite(input.potencia_kw) || input.potencia_kw <= 0) {
    errors.potencia_kw = 'La potencia (kW) debe ser un número mayor a 0.';
  }

  if (!input.fecha_inicio) {
    errors.fecha_inicio = 'La fecha de inicio es obligatoria.';
  }

  if (!input.fecha_estimada_fin) {
    errors.fecha_estimada_fin = 'La fecha estimada de fin es obligatoria.';
  } else if (input.fecha_inicio && input.fecha_estimada_fin < input.fecha_inicio) {
    errors.fecha_estimada_fin = 'La fecha de fin no puede ser anterior a la de inicio.';
  }

  return errors;
}

export function hasValidationErrors(errors: ProyectoFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
