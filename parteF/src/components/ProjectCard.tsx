import type { ProyectoResumen } from '../types/database';
import { StatusBadge } from './StatusBadge';

export function ProjectCard({ project }: { project: ProyectoResumen }) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-slate-900">{project.nombre}</h3>
        <StatusBadge status={project.estado} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">Costo materiales</dt>
          <dd className="font-semibold text-slate-900">${project.costo_total.toFixed(2)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">Materiales</dt>
          <dd className="font-semibold text-slate-900">{project.cantidad_materiales}</dd>
        </div>
      </dl>
    </li>
  );
}
