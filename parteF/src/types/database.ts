/**
 * Tipos de TypeScript generados a partir del esquema de Supabase
 * (supabase/migrations/20261013_inicializar_esquema.sql). En un proyecto
 * real se regenerarían con `supabase gen types typescript`; acá se
 * escribieron a mano siguiendo exactamente esa misma estructura (tabla
 * Row/Insert/Update por entidad), para no depender de un proyecto
 * Supabase ya desplegado en este entorno de desarrollo.
 */

export type ProjectStatus = 'pendiente' | 'en_progreso' | 'completado';

export interface Instalador {
  id: string;
  nombre: string;
  especialidad: string;
  telefono: string | null;
}

export interface Proyecto {
  id: string;
  nombre: string;
  direccion: string;
  potencia_kw: number;
  estado: ProjectStatus;
  instalador_id: string;
  fecha_inicio: string;
  fecha_estimada_fin: string;
  created_at: string;
}

export interface NewProyectoInput {
  nombre: string;
  direccion: string;
  potencia_kw: number;
  instalador_id: string;
  fecha_inicio: string;
  fecha_estimada_fin: string;
}

export interface Material {
  id: string;
  proyecto_id: string;
  nombre: string;
  cantidad: number;
  costo_unitario: number;
}

/** Fila de la vista public.proyectos_resumen (proyectos + costo agregado). */
export interface ProyectoResumen {
  id: string;
  nombre: string;
  estado: ProjectStatus;
  instalador_id: string;
  costo_total: number;
  cantidad_materiales: number;
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En Progreso',
  completado: 'Completado',
};
