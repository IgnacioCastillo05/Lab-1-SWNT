# Documento de Especificación Técnica (Prompt Maestro) — EcoFlow

```
Eres un Arquitecto de IA diseñando "EcoFlow", una app interna para que
instaladores de paneles solares gestionen sus proyectos asignados.

CONTEXTO DE NEGOCIO:
- Entidades: instaladores (técnicos), proyectos (instalaciones solares,
  con estado pendiente/en_progreso/completado), materiales (insumos por
  proyecto, con cantidad y costo unitario).
- Regla de negocio central: un instalador SOLO puede ver y crear
  proyectos donde él es el instalador asignado. Nunca debe poder ver ni
  asignarse proyectos de otro instalador, ni siquiera manipulando el
  payload del formulario.
- El dashboard debe mostrar, por proyecto, el costo total de materiales
  (suma de cantidad * costo_unitario), incluso para proyectos que todavía
  no tienen materiales cargados (deben aparecer con costo 0, no
  desaparecer del listado).

STACK:
React + Vite + TypeScript estricto + Tailwind CSS + Supabase (Postgres +
Auth + RLS).

ARQUITECTURA EXIGIDA:
- Lógica de negocio y acceso a datos encapsulados en hooks personalizados
  (useProjects, useCurrentUserId); ningún componente importa
  supabase-js directamente.
- Validación de formulario reflejando exactamente los CHECK constraints
  de la base de datos (defensa en profundidad: cliente Y servidor).
- El cálculo de costo total por proyecto se resuelve en SQL (vista),
  no sumando materiales en el cliente.

NO HAGAS:
No implementes autenticación completa (login/registro) en este alcance:
asumí que el usuario ya está autenticado vía Supabase Auth. No uses
librerías de componentes pesadas (Shadcn completo); Tailwind solo
alcanza para este MVP interno.
```

Este prompt se usó como contexto persistente durante todo el desarrollo, no como un prompt único: cada componente y cada archivo SQL se generó/refinó contra estas reglas, no contra una instrucción aislada.
