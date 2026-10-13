import { useCurrentUserId } from '../hooks/useCurrentUserId';
import { useProjects } from '../hooks/useProjects';
import { ProjectCard } from './ProjectCard';
import { ProjectForm } from './ProjectForm';

export function Dashboard() {
  const { projects, loading, error, createProject } = useProjects();
  const instaladorId = useCurrentUserId();

  return (
    <section aria-labelledby="dashboard-heading" className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 id="dashboard-heading" className="text-2xl font-semibold text-slate-900">
          EcoFlow — Mis Proyectos
        </h1>
        <p className="text-slate-600">Instalaciones de paneles solares asignadas a vos.</p>
      </header>

      <ProjectForm instaladorId={instaladorId} onSubmit={createProject} />

      {error && (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          No se pudo cargar/guardar la información: {error}
        </div>
      )}

      {loading ? (
        <div role="status" className="py-10 text-center text-slate-500">Cargando proyectos…</div>
      ) : projects.length === 0 ? (
        <p className="py-10 text-center text-slate-500">
          Todavía no tenés proyectos asignados. Creá el primero con el formulario de arriba.
        </p>
      ) : (
        <ul aria-label="Listado de proyectos" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </ul>
      )}
    </section>
  );
}
