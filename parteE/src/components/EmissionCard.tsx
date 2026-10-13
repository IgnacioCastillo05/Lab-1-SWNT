import type { EmissionRecord } from '../types/emissions';

const CATEGORY_STYLES: Record<EmissionRecord['category'], string> = {
  Transporte: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Energía: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Residuos: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
};

interface EmissionCardProps {
  emission: EmissionRecord;
}

export function EmissionCard({ emission }: EmissionCardProps) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-slate-900">{emission.source_name}</h3>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${CATEGORY_STYLES[emission.category]}`}
        >
          {emission.category}
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-900">
        {emission.co2_kg.toFixed(2)} <span className="text-sm font-normal text-slate-500">kg CO2</span>
      </p>
    </li>
  );
}
