import { useEmissions } from '../hooks/useEmissions';
import { EmissionCard } from './EmissionCard';
import { EmissionForm } from './EmissionForm';

export function EmissionsTracker() {
  const { emissions, loading, error, totalCo2Kg, addEmission } = useEmissions();

  return (
    <section
      aria-labelledby="emissions-tracker-heading"
      className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6"
    >
      <header className="flex flex-col gap-1">
        <h1 id="emissions-tracker-heading" className="text-2xl font-semibold text-slate-900">
          Dashboard de Emisiones en Tiempo Real
        </h1>
        <p className="text-slate-600">
          Total acumulado:{' '}
          <span className="font-semibold text-slate-900">{totalCo2Kg.toFixed(2)} kg CO2</span>
        </p>
      </header>

      <EmissionForm onSubmit={addEmission} />

      {error && (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          No se pudo cargar/guardar la información: {error}
        </div>
      )}

      {loading ? (
        <div role="status" className="py-10 text-center text-slate-500">
          Cargando mediciones…
        </div>
      ) : emissions.length === 0 ? (
        <p className="py-10 text-center text-slate-500">
          Todavía no hay mediciones registradas. Agregá la primera con el formulario de arriba.
        </p>
      ) : (
        <ul
          aria-label="Listado de mediciones de emisiones"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {emissions.map((emission) => (
            <EmissionCard key={emission.id} emission={emission} />
          ))}
        </ul>
      )}
    </section>
  );
}
