import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { NewProyectoInput, ProyectoResumen } from '../src/types/database';

const { fromMock } = vi.hoisted(() => ({ fromMock: vi.fn() }));

vi.mock('../src/lib/supabase', () => ({
  supabase: { from: fromMock },
}));

const { useProjects } = await import('../src/hooks/useProjects');

const sampleProject: ProyectoResumen = {
  id: 'p1',
  nombre: 'Planta Solar Norte',
  estado: 'pendiente',
  instalador_id: 'u1',
  costo_total: 2755,
  cantidad_materiales: 2,
};

const validInput: NewProyectoInput = {
  nombre: 'Techo Solar Sur',
  direccion: 'Calle Luna 45',
  potencia_kw: 3.2,
  instalador_id: 'u1',
  fecha_inicio: '2026-01-10',
  fecha_estimada_fin: '2026-01-25',
};

function mockSelectChain(result: { data: unknown; error: { message: string } | null }) {
  return { select: () => ({ order: () => Promise.resolve(result) }) };
}

function mockInsertChain(result: { error: { message: string } | null }) {
  return { insert: () => Promise.resolve(result) };
}

beforeEach(() => {
  fromMock.mockReset();
});

describe('useProjects', () => {
  it('carga los proyectos desde la vista proyectos_resumen', async () => {
    fromMock.mockReturnValue(mockSelectChain({ data: [sampleProject], error: null }));

    const { result } = renderHook(() => useProjects());
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.projects).toEqual([sampleProject]);
  });

  it('expone un mensaje de error si la carga falla, sin lanzar excepción', async () => {
    fromMock.mockReturnValue(mockSelectChain({ data: null, error: { message: 'timeout' } }));

    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('timeout');
  });

  it('createProject NO llama a Supabase si la validación de cliente falla', async () => {
    fromMock.mockReturnValue(mockSelectChain({ data: [], error: null }));
    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const callsBefore = fromMock.mock.calls.length;
    let errors;
    await act(async () => {
      errors = await result.current.createProject({ ...validInput, potencia_kw: -1 });
    });

    expect(errors).toMatchObject({ potencia_kw: expect.any(String) });
    expect(fromMock.mock.calls.length).toBe(callsBefore); // no se tocó Supabase
  });

  it('createProject inserta y refetchea la lista cuando los datos son válidos', async () => {
    fromMock.mockReturnValueOnce(mockSelectChain({ data: [], error: null }));
    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.loading).toBe(false));

    fromMock.mockReturnValueOnce(mockInsertChain({ error: null }));
    fromMock.mockReturnValueOnce(mockSelectChain({ data: [sampleProject], error: null }));

    await act(async () => {
      await result.current.createProject(validInput);
    });

    expect(result.current.projects).toEqual([sampleProject]);
  });

  it('createProject expone el error de Supabase (ej. violación de RLS) sin romper la app', async () => {
    fromMock.mockReturnValueOnce(mockSelectChain({ data: [], error: null }));
    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.loading).toBe(false));

    fromMock.mockReturnValueOnce(mockInsertChain({ error: { message: 'new row violates row-level security policy' } }));

    await act(async () => {
      await result.current.createProject(validInput);
    });

    expect(result.current.error).toBe('new row violates row-level security policy');
  });
});
