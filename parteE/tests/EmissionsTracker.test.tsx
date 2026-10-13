import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { fromMock } = vi.hoisted(() => ({ fromMock: vi.fn() }));

vi.mock('../src/lib/supabase', () => ({
  supabase: { from: fromMock },
}));

const { EmissionsTracker } = await import('../src/components/EmissionsTracker');

function mockSelectChain(data: unknown[]) {
  return { select: () => ({ order: () => Promise.resolve({ data, error: null }) }) };
}

function mockInsertChain(data: unknown) {
  return { insert: () => ({ select: () => ({ single: () => Promise.resolve({ data, error: null }) }) }) };
}

beforeEach(() => {
  fromMock.mockReset();
});

describe('EmissionsTracker', () => {
  it('muestra el estado de carga y luego las tarjetas de emisiones', async () => {
    fromMock.mockReturnValue(
      mockSelectChain([
        { id: '1', source_name: 'Flota de reparto', category: 'Transporte', co2_kg: 42.5, created_at: '2026-01-01' },
      ]),
    );

    render(<EmissionsTracker />);

    expect(screen.getByRole('status')).toHaveTextContent(/cargando/i);

    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

    const list = screen.getByRole('list', { name: /listado de mediciones/i });
    expect(within(list).getByText('Flota de reparto')).toBeInTheDocument();
    expect(within(list).getByText('Transporte')).toBeInTheDocument();
  });

  it('muestra el mensaje de "sin mediciones" cuando la lista está vacía', async () => {
    fromMock.mockReturnValue(mockSelectChain([]));

    render(<EmissionsTracker />);

    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

    expect(screen.getByText(/todavía no hay mediciones/i)).toBeInTheDocument();
  });

  it('permite agregar una medición con el formulario y la refleja en el listado', async () => {
    fromMock.mockReturnValueOnce(mockSelectChain([]));
    render(<EmissionsTracker />);
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

    fromMock.mockReturnValueOnce(
      mockInsertChain({ id: '9', source_name: 'Planta solar', category: 'Energía', co2_kg: 3.2, created_at: '2026-01-02' }),
    );

    fireEvent.change(screen.getByLabelText('Fuente'), { target: { value: 'Planta solar' } });
    fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: 'Energía' } });
    fireEvent.change(screen.getByLabelText('CO2 (kg)'), { target: { value: '3.2' } });
    fireEvent.click(screen.getByRole('button', { name: /agregar medición/i }));

    await waitFor(() => expect(screen.getByText('Planta solar')).toBeInTheDocument());
  });

  it('muestra un mensaje de error accesible (role=alert) si Supabase falla', async () => {
    fromMock.mockReturnValue({
      select: () => ({ order: () => Promise.resolve({ data: null, error: { message: 'timeout' } }) }),
    });

    render(<EmissionsTracker />);

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('timeout'));
  });
});
