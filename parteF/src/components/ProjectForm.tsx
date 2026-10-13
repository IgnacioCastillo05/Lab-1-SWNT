import { useId, useState } from 'react';

import type { ProyectoFormErrors } from '../lib/validators';
import type { NewProyectoInput } from '../types/database';

interface ProjectFormProps {
  instaladorId: string | null;
  onSubmit: (input: NewProyectoInput) => Promise<ProyectoFormErrors>;
}

export function ProjectForm({ instaladorId, onSubmit }: ProjectFormProps) {
  const formId = useId();
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [potenciaKw, setPotenciaKw] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [errors, setErrors] = useState<ProyectoFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!instaladorId) return;

    setSubmitting(true);
    const result = await onSubmit({
      nombre,
      direccion,
      potencia_kw: Number(potenciaKw),
      instalador_id: instaladorId,
      fecha_inicio: fechaInicio,
      fecha_estimada_fin: fechaFin,
    });
    setSubmitting(false);
    setErrors(result);

    if (Object.keys(result).length === 0) {
      setNombre('');
      setDireccion('');
      setPotenciaKw('');
      setFechaInicio('');
      setFechaFin('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Crear nuevo proyecto"
      className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2"
    >
      <div className="flex flex-col gap-1 sm:col-span-2">
        <label htmlFor={`${formId}-nombre`} className="text-sm font-medium text-slate-700">Nombre del proyecto</label>
        <input
          id={`${formId}-nombre`}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        {errors.nombre && <p role="alert" className="text-xs text-red-600">{errors.nombre}</p>}
      </div>

      <div className="flex flex-col gap-1 sm:col-span-2">
        <label htmlFor={`${formId}-direccion`} className="text-sm font-medium text-slate-700">Dirección</label>
        <input
          id={`${formId}-direccion`}
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        {errors.direccion && <p role="alert" className="text-xs text-red-600">{errors.direccion}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${formId}-potencia`} className="text-sm font-medium text-slate-700">Potencia (kW)</label>
        <input
          id={`${formId}-potencia`}
          type="number"
          step="0.1"
          value={potenciaKw}
          onChange={(e) => setPotenciaKw(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        {errors.potencia_kw && <p role="alert" className="text-xs text-red-600">{errors.potencia_kw}</p>}
      </div>

      <div />

      <div className="flex flex-col gap-1">
        <label htmlFor={`${formId}-inicio`} className="text-sm font-medium text-slate-700">Fecha de inicio</label>
        <input
          id={`${formId}-inicio`}
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        {errors.fecha_inicio && <p role="alert" className="text-xs text-red-600">{errors.fecha_inicio}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${formId}-fin`} className="text-sm font-medium text-slate-700">Fecha estimada de fin</label>
        <input
          id={`${formId}-fin`}
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        {errors.fecha_estimada_fin && <p role="alert" className="text-xs text-red-600">{errors.fecha_estimada_fin}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting || !instaladorId}
        className="sm:col-span-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Creando…' : 'Crear proyecto'}
      </button>
    </form>
  );
}
