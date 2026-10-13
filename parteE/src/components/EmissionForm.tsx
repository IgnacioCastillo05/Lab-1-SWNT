import { useId, useState } from 'react';

import {
  DEFAULT_EMISSION_CATEGORY,
  EMISSION_CATEGORIES,
  type EmissionCategory,
  type NewEmissionInput,
} from '../types/emissions';

interface EmissionFormProps {
  onSubmit: (input: NewEmissionInput) => Promise<void>;
}

export function EmissionForm({ onSubmit }: EmissionFormProps) {
  const formId = useId();
  const [sourceName, setSourceName] = useState('');
  const [category, setCategory] = useState<EmissionCategory>(DEFAULT_EMISSION_CATEGORY);
  const [co2Kg, setCo2Kg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedCo2 = Number(co2Kg);
    if (!sourceName.trim() || !Number.isFinite(parsedCo2) || parsedCo2 <= 0) return;

    setSubmitting(true);
    try {
      await onSubmit({ source_name: sourceName.trim(), category, co2_kg: parsedCo2 });
      setSourceName('');
      setCo2Kg('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Agregar nueva medición de emisiones"
      className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex min-w-40 flex-1 flex-col gap-1">
        <label htmlFor={`${formId}-source`} className="text-sm font-medium text-slate-700">
          Fuente
        </label>
        <input
          id={`${formId}-source`}
          type="text"
          required
          value={sourceName}
          onChange={(event) => setSourceName(event.target.value)}
          placeholder="Ej: Flota de reparto"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${formId}-category`} className="text-sm font-medium text-slate-700">
          Categoría
        </label>
        <select
          id={`${formId}-category`}
          value={category}
          onChange={(event) => setCategory(event.target.value as EmissionCategory)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {EMISSION_CATEGORIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex w-32 flex-col gap-1">
        <label htmlFor={`${formId}-co2`} className="text-sm font-medium text-slate-700">
          CO2 (kg)
        </label>
        <input
          id={`${formId}-co2`}
          type="number"
          required
          min="0.01"
          step="0.01"
          value={co2Kg}
          onChange={(event) => setCo2Kg(event.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Guardando…' : 'Agregar medición'}
      </button>
    </form>
  );
}
