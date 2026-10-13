# Bitácora de Prompts — Ciclo Spec-to-Code: EmissionsTracker

Las 4 iteraciones clave usadas para transformar la especificación en código, con Claude Code como copiloto. Cada prompt se construye sobre el resultado del anterior (no se descartó ningún intento, se refinó).

## Prompt 1 — Estructura (arquitectura de componentes)

```
A partir de esta especificación: EmissionsTracker debe mostrar un listado
de tarjetas con nombre de fuente, categoría (Transporte/Energía/Residuos)
y CO2 producido; un formulario para agregar mediciones; estado gestionado
por un hook useEmissions que hable con Supabase; y diseño con Tailwind.

Proponé la arquitectura de componentes en React + TypeScript antes de
escribir código: qué componentes separados hacen falta, qué responsabilidad
tiene cada uno, y por qué ninguno debería importar Supabase directamente.
```

**Resultado:** se definió separar `EmissionsTracker` (orquestador, consume el hook), `EmissionCard` (presentacional puro, 1 card) y `EmissionForm` (presentacional + estado local del formulario), con `useEmissions` como única puerta de entrada a Supabase — ningún componente conoce `@supabase/supabase-js`.

## Prompt 2 — Lógica (Custom Hook useEmissions)

```
Implementá useEmissions() en TypeScript: debe exponer emissions, loading,
error y una función addEmission(input). Al montar, carga desde la tabla
"emissions" ordenada por fecha descendente. loading debe ser true durante
la carga inicial Y durante cualquier operación async. Si Supabase devuelve
error, no lances una excepción: expón el mensaje en el estado `error` para
que la UI lo muestre controladamente.
```

**Resultado:** primera versión del hook con `fetchEmissions`, `loading`/`error` en estado, y `addEmission` que insertaba y luego volvía a pedir toda la lista (`refetch` completo tras cada inserción).

## Prompt 3 — Refinamiento (restricciones técnicas)

```
Sobre el hook anterior: 1) Activá TypeScript estricto (strict +
noUncheckedIndexedAccess) y corregí cualquier error que aparezca — no los
ignores con "as" o "!". 2) addEmission no debería refetchear toda la
lista tras cada inserción exitosa, es un round-trip innecesario: actualizá
el estado local con el registro insertado (Supabase ya lo devuelve con
.select().single()). 3) El componente debe ser accesible: inputs con
<label> asociado, el contenedor de error con role="alert", el de carga
con role="status", y el listado de cards con aria-label descriptivo.
```

**Resultado real de aplicar TypeScript estricto:** `noUncheckedIndexedAccess` detectó que `EMISSION_CATEGORIES[0]` tipaba como `EmissionCategory | undefined`, rompiendo el build (`tsc -b` fallaba). Se corrigió reemplazando el acceso por índice por una constante explícita `DEFAULT_EMISSION_CATEGORY`, en vez de silenciar el error con `!`. `addEmission` se reescribió para actualización optimista (`setEmissions(prev => [nuevo, ...prev])`) en vez de refetch completo. Se agregaron los roles de accesibilidad pedidos.

## Prompt 4 — Optimización de re-renders (useMemo)

```
El dashboard muestra un total de CO2 acumulado. Si eso se recalcula
sumando el arreglo completo en cada render, con cientos de mediciones deja
de ser gratis. Memoizá ese cálculo con useMemo y agregá un comentario
corto explicando por qué, no solo que "optimiza".
```

**Resultado:** `totalCo2Kg` se movió a `useMemo(() => emissions.reduce(...), [emissions])`, con el comentario documentando que el costo solo se paga cuando `emissions` cambia de referencia, no en cada render del componente padre.

## Validación final (ejecutada, no solo revisada a ojo)

- `npx tsc -b` → sin errores en modo estricto.
- `npm run test` (Vitest + Testing Library, Supabase mockeado) → **9/9 tests en verde**, cubriendo: carga exitosa, error de carga sin excepción, cálculo de `totalCo2Kg`, inserción optimista, error de inserción sin perder datos existentes, estados de loading/vacío/error en la UI, y el flujo completo de agregar una medición desde el formulario.
- `npm run build` → compila sin errores.
- Captura real del dashboard renderizado (desktop y mobile) en `screenshots/`, generada con Playwright contra el componente real corriendo en `npm run dev` (con datos de ejemplo, ya que no hay un proyecto Supabase productivo conectado a este entorno).
