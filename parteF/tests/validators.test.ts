import { describe, expect, it } from 'vitest';

import { hasValidationErrors, validateNewProyecto } from '../src/lib/validators';

const validInput = {
  nombre: 'Planta Solar Norte',
  direccion: 'Av. Sol 123',
  potencia_kw: 5.5,
  instalador_id: 'x',
  fecha_inicio: '2026-01-01',
  fecha_estimada_fin: '2026-02-01',
};

describe('validateNewProyecto', () => {
  it('no reporta errores para una entrada completa y válida', () => {
    expect(hasValidationErrors(validateNewProyecto(validInput))).toBe(false);
  });

  it('rechaza nombre menor a 3 caracteres', () => {
    const errors = validateNewProyecto({ ...validInput, nombre: 'Ab' });
    expect(errors.nombre).toBeDefined();
  });

  it('rechaza potencia_kw cero o negativa', () => {
    expect(validateNewProyecto({ ...validInput, potencia_kw: 0 }).potencia_kw).toBeDefined();
    expect(validateNewProyecto({ ...validInput, potencia_kw: -3 }).potencia_kw).toBeDefined();
  });

  it('rechaza potencia_kw no numérica (NaN)', () => {
    expect(validateNewProyecto({ ...validInput, potencia_kw: Number.NaN }).potencia_kw).toBeDefined();
  });

  it('rechaza dirección vacía', () => {
    expect(validateNewProyecto({ ...validInput, direccion: '  ' }).direccion).toBeDefined();
  });

  it('rechaza fecha_estimada_fin anterior a fecha_inicio', () => {
    const errors = validateNewProyecto({ ...validInput, fecha_inicio: '2026-02-01', fecha_estimada_fin: '2026-01-01' });
    expect(errors.fecha_estimada_fin).toBeDefined();
  });

  it('acepta fecha_estimada_fin igual a fecha_inicio (proyecto de 1 día)', () => {
    const errors = validateNewProyecto({ ...validInput, fecha_inicio: '2026-01-01', fecha_estimada_fin: '2026-01-01' });
    expect(errors.fecha_estimada_fin).toBeUndefined();
  });

  it('reporta múltiples errores simultáneos sin detenerse en el primero', () => {
    const errors = validateNewProyecto({ nombre: '', direccion: '', potencia_kw: -1 });
    expect(Object.keys(errors).length).toBeGreaterThanOrEqual(4);
  });
});
