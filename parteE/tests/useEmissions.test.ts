import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { EmissionRecord } from '../src/types/emissions';

const { fromMock } = vi.hoisted(() => ({ fromMock: vi.fn() }));

vi.mock('../src/lib/supabase', () => ({
  supabase: { from: fromMock },
}));

const { useEmissions } = await import('../src/hooks/useEmissions');

const sampleRecord: EmissionRecord = {
  id: '1',
  source_name: 'Flota de reparto',
  category: 'Transporte',
  co2_kg: 42.5,
  created_at: '2026-01-01T00:00:00Z',
};

function mockSelectChain(result: { data: EmissionRecord[] | null; error: { message: string } | null }) {
  return {
    select: () => ({
      order: () => Promise.resolve(result),
    }),
  };
}

function mockInsertChain(result: { data: EmissionRecord | null; error: { message: string } | null }) {
  return {
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve(result),
      }),
    }),
  };
}

beforeEach(() => {
  fromMock.mockReset();
});

describe('useEmissions', () => {
  it('carga las emisiones al montar y expone loading correctamente', async () => {
    fromMock.mockReturnValue(mockSelectChain({ data: [sampleRecord], error: null }));

    const { result } = renderHook(() => useEmissions());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.emissions).toEqual([sampleRecord]);
    expect(result.current.error).toBeNull();
  });

  it('expone un mensaje de error si la carga falla, sin lanzar una excepción', async () => {
    fromMock.mockReturnValue(mockSelectChain({ data: null, error: { message: 'conexión rechazada' } }));

    const { result } = renderHook(() => useEmissions());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('conexión rechazada');
    expect(result.current.emissions).toEqual([]);
  });

  it('calcula totalCo2Kg como la suma de todas las emisiones cargadas', async () => {
    const second: EmissionRecord = { ...sampleRecord, id: '2', co2_kg: 7.5 };
    fromMock.mockReturnValue(mockSelectChain({ data: [sampleRecord, second], error: null }));

    const { result } = renderHook(() => useEmissions());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.totalCo2Kg).toBe(50);
  });

  it('agrega una emisión de forma optimista sin volver a pedir toda la lista', async () => {
    fromMock.mockReturnValueOnce(mockSelectChain({ data: [], error: null }));

    const { result } = renderHook(() => useEmissions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    fromMock.mockReturnValueOnce(mockInsertChain({ data: sampleRecord, error: null }));

    await act(async () => {
      await result.current.addEmission({
        source_name: sampleRecord.source_name,
        category: sampleRecord.category,
        co2_kg: sampleRecord.co2_kg,
      });
    });

    expect(result.current.emissions).toEqual([sampleRecord]);
    expect(fromMock).toHaveBeenCalledTimes(2);
  });

  it('expone un error si la inserción falla, sin modificar la lista existente', async () => {
    fromMock.mockReturnValueOnce(mockSelectChain({ data: [sampleRecord], error: null }));
    const { result } = renderHook(() => useEmissions());
    await waitFor(() => expect(result.current.loading).toBe(false));

    fromMock.mockReturnValueOnce(mockInsertChain({ data: null, error: { message: 'co2_kg debe ser positivo' } }));

    await act(async () => {
      await result.current.addEmission({ source_name: 'x', category: 'Energía', co2_kg: -1 });
    });

    expect(result.current.error).toBe('co2_kg debe ser positivo');
    expect(result.current.emissions).toEqual([sampleRecord]);
  });
});
