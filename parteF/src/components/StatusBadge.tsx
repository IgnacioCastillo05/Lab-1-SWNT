import { PROJECT_STATUS_LABELS, type ProjectStatus } from '../types/database';

const STATUS_STYLES: Record<ProjectStatus, string> = {
  pendiente: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  en_progreso: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  completado: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}>
      {PROJECT_STATUS_LABELS[status]}
    </span>
  );
}
