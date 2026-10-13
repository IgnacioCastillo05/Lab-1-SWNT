# Documento de Arquitectura — EcoFlow

## Diagrama de la base de datos

```
instaladores (1) ──────< (N) proyectos (1) ──────< (N) materiales
  id (PK, = auth.users.id)   id (PK)                   id (PK)
  nombre                     nombre                     proyecto_id (FK)
  especialidad               direccion                  nombre
  telefono                   potencia_kw                cantidad
                             estado (enum)               costo_unitario
                             instalador_id (FK)
                             fecha_inicio
                             fecha_estimada_fin

  VIEW proyectos_resumen = proyectos LEFT JOIN materiales
    (agrega costo_total y cantidad_materiales por proyecto)
```

`estado` está restringido por CHECK a `pendiente | en_progreso | completado`. `potencia_kw > 0`, `cantidad > 0`, `costo_unitario >= 0`, y `fecha_estimada_fin >= fecha_inicio` también son CHECK constraints — la UI los refleja pero la base es la autoridad final (ver `src/lib/validators.ts`).

## Políticas RLS (justificación)

Cada instalador ve y crea **solo sus propios proyectos** (`instalador_id = auth.uid()` en SELECT, INSERT y UPDATE de `proyectos`). `materiales` no tiene columna de instalador propia: su política usa `EXISTS` contra `proyectos` para heredar el mismo aislamiento sin duplicar lógica de autorización en dos tablas. El esquema completo (con comentarios) está en `supabase/migrations/20261013_inicializar_esquema.sql`, validado contra Postgres 16 real: un instalador que intenta insertarse un proyecto asignado a otro instalador recibe `new row violates row-level security policy`.

## Uso de IA para un problema técnico complejo

**La consulta SQL difícil:** el dashboard necesita el costo total de materiales por proyecto. La primera versión de la vista agregada (`proyectos_resumen`, un `LEFT JOIN` + `COALESCE(SUM(...), 0)` para que un proyecto sin materiales aparezca con costo 0 en vez de desaparecer del resultado) parecía correcta — compilaba y devolvía datos razonables en pruebas manuales rápidas.

**El bug real que encontré probándola, no leyéndola:** al simular dos instaladores distintos contra Postgres real, **la vista ignoraba RLS por completo** — cualquier instalador veía los proyectos de todos los demás a través de `proyectos_resumen`, aunque las políticas de la tabla base `proyectos` estaban bien escritas y ya verificadas. La causa: en Postgres, una vista por defecto se ejecuta con los privilegios de su **dueño**, no del rol que la consulta — las políticas RLS se evalúan contra el dueño de la vista, no contra el usuario real. Es un matiz no obvio incluso para alguien que ya sabe escribir RLS correctamente en tablas.

**Fix:** `CREATE VIEW ... WITH (security_invoker = true)` (disponible desde Postgres 15), que fuerza a la vista a evaluarse con los permisos y las políticas del rol que la invoca. Reproduje el mismo ataque después del fix: cada instalador volvió a ver solo su propio proyecto en la vista. Esto quedó documentado directamente como comentario en la migración SQL para que nadie lo vuelva a sacar "por limpieza" sin entender por qué está ahí.

## Capturas

`screenshots/dashboard.png` (3 proyectos en los 3 estados posibles, con costos agregados reales), `screenshots/form-validation.png` (los 4 errores de validación mostrados simultáneamente, sin tocar la red hasta que el formulario es válido), y `screenshots/dashboard-mobile.png` (diseño responsive). No se incluye un video narrado real: este proyecto fue generado por un agente de código sin micrófono ni grabadora de pantalla con audio; las capturas con Playwright, generadas contra la app corriendo de verdad, son la evidencia funcional equivalente disponible en este entorno.
