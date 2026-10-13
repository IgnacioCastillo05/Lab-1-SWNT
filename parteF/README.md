# EcoFlow — Gestión de Proyectos de Paneles Solares

Dashboard para que instaladores gestionen sus proyectos de instalación solar asignados. Construido como Proyecto Final Integrador: React + Vite + TypeScript estricto + Tailwind CSS + Supabase (Postgres + RLS).

## Contenido

```
supabase/migrations/   → Esquema completo: tablas, vista agregada, RLS (validado contra Postgres 16 real)
src/
├── lib/supabase.ts     → Cliente único de Supabase
├── lib/validators.ts   → Validación de formulario (espejo de los CHECK de la base)
├── types/database.ts   → Tipos TS generados a partir del esquema
├── hooks/useProjects.ts        → Fetch + creación de proyectos
├── hooks/useCurrentUserId.ts   → Usuario autenticado actual
└── components/
    ├── Dashboard.tsx, ProjectCard.tsx, ProjectForm.tsx, StatusBadge.tsx
tests/                  → Vitest + Testing Library (13 tests, Supabase mockeado)
docs/
├── master-prompt.md    → Documento de Especificación Técnica (Prompt Maestro)
└── arquitectura.md     → Diagrama de BD, políticas RLS, y el bug real de seguridad encontrado y corregido
screenshots/            → Capturas reales (dashboard, validación de formulario, mobile)
```

## Cómo correrlo

```bash
cp .env.example .env    # completar con tu proyecto de Supabase
npm install
npm run test             # 13 passed
npm run build              # TypeScript estricto, sin errores
npm run dev                  # http://localhost:5173
```

Para aplicar el esquema a un proyecto Supabase real: `supabase db push` (tras `supabase link --project-ref <ref>`), usando el archivo en `supabase/migrations/`.
