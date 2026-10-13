# EcoTrack — Dashboard de Emisiones en Tiempo Real

MVP del componente `EmissionsTracker` para el equipo de frontend de EcoTrack, construido con el ciclo Spec-to-Code (ver `docs/bitacora-prompts.md`).

## Stack

React 19 + Vite + TypeScript (modo estricto) + Tailwind CSS 4 + Supabase.

## Contenido

```
src/
├── lib/supabase.ts          → Cliente de Supabase (único punto de contacto)
├── types/emissions.ts       → Tipos compartidos (EmissionRecord, categorías)
├── hooks/useEmissions.ts    → Toda la lógica de carga/inserción/error
└── components/
    ├── EmissionsTracker.tsx → Orquestador: layout, loading, error, vacío
    ├── EmissionCard.tsx     → Tarjeta individual (presentacional)
    └── EmissionForm.tsx     → Formulario accesible de nueva medición
tests/                       → Vitest + Testing Library (9 tests, Supabase mockeado)
docs/bitacora-prompts.md     → Las 4 iteraciones del ciclo Spec-to-Code
screenshots/                 → Capturas reales del dashboard (desktop + mobile)
```

## Cómo correrlo

```bash
cp .env.example .env   # completar con tu URL y anon key de Supabase
npm install
npm run test            # 9 passed
npm run build            # compila en TS estricto
npm run dev               # http://localhost:5173
```

### Esquema esperado en Supabase

La tabla `emissions` esperada por el hook: `id uuid`, `source_name text`, `category text` (`Transporte`/`Energía`/`Residuos`), `co2_kg numeric`, `created_at timestamptz`.

## Capturas

`screenshots/dashboard-desktop.png` y `screenshots/dashboard-mobile.png`: generadas con Playwright contra el componente real corriendo en `npm run dev`, usando datos de ejemplo (no hay un proyecto Supabase productivo conectado a este entorno de desarrollo). Muestran el listado de tarjetas, el formulario, y el diseño responsive en ambos tamaños de pantalla.
