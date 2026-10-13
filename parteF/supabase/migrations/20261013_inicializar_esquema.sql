-- EcoFlow — Esquema de base de datos
-- Tablas: instaladores, proyectos, materiales
--
-- auth.users y auth.uid() ya existen nativamente en todo proyecto de
-- Supabase; no se recrean acá. (Este esquema fue validado localmente
-- contra Postgres 16 simulando ambas, ver docs/arquitectura.md.)

CREATE TABLE public.instaladores (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  especialidad text NOT NULL DEFAULT 'general',
  telefono text
);

CREATE TABLE public.proyectos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL CHECK (char_length(nombre) >= 3),
  direccion text NOT NULL,
  potencia_kw numeric NOT NULL CHECK (potencia_kw > 0),
  estado text NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'en_progreso', 'completado')),
  instalador_id uuid NOT NULL REFERENCES public.instaladores(id) ON DELETE CASCADE,
  fecha_inicio date NOT NULL,
  fecha_estimada_fin date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fechas_coherentes CHECK (fecha_estimada_fin >= fecha_inicio)
);

CREATE TABLE public.materiales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id uuid NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  cantidad numeric NOT NULL CHECK (cantidad > 0),
  costo_unitario numeric NOT NULL CHECK (costo_unitario >= 0)
);

CREATE INDEX idx_proyectos_instalador ON public.proyectos(instalador_id);
CREATE INDEX idx_materiales_proyecto ON public.materiales(proyecto_id);

-- Vista agregada: problema SQL "difícil" resuelto con asistencia de IA
-- (ver docs/arquitectura.md, sección "Uso de IA"): LEFT JOIN + COALESCE
-- para que un proyecto SIN materiales todavía siga apareciendo con costo 0,
-- en vez de desaparecer del resultado (como pasaría con un INNER JOIN).
-- security_invoker = true es OBLIGATORIO: sin esto, la vista corre con
-- los permisos del dueño de la vista y NO respeta RLS del rol que
-- consulta (bug real detectado y corregido durante este proyecto, ver
-- docs/arquitectura.md "Uso de IA" — un instalador veía los proyectos
-- de TODOS los demás a través de esta vista hasta aplicar este fix).
CREATE VIEW public.proyectos_resumen
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.nombre,
  p.estado,
  p.instalador_id,
  COALESCE(SUM(m.cantidad * m.costo_unitario), 0) AS costo_total,
  COUNT(m.id) AS cantidad_materiales
FROM public.proyectos p
LEFT JOIN public.materiales m ON m.proyecto_id = p.id
GROUP BY p.id, p.nombre, p.estado, p.instalador_id;

-- =========================================================
-- RLS
-- =========================================================
ALTER TABLE public.instaladores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "instaladores_select_propio" ON public.instaladores
  FOR SELECT USING (id = auth.uid());

-- Cada instalador ve y crea SOLO sus propios proyectos asignados.
CREATE POLICY "proyectos_select_propios" ON public.proyectos
  FOR SELECT USING (instalador_id = auth.uid());
CREATE POLICY "proyectos_insert_propio" ON public.proyectos
  FOR INSERT WITH CHECK (instalador_id = auth.uid());
CREATE POLICY "proyectos_update_propio" ON public.proyectos
  FOR UPDATE USING (instalador_id = auth.uid());

-- materiales: visibles solo si pertenecen a un proyecto del instalador.
CREATE POLICY "materiales_select_por_proyecto" ON public.materiales
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.proyectos p WHERE p.id = proyecto_id AND p.instalador_id = auth.uid())
  );
CREATE POLICY "materiales_insert_por_proyecto" ON public.materiales
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.proyectos p WHERE p.id = proyecto_id AND p.instalador_id = auth.uid())
  );
