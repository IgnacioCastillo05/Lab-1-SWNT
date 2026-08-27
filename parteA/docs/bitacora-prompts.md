# Bitácora de Prompts — Carbon Tracker Service

Registro de los prompts principales utilizados con el LLM (Claude) como *pair programmer*, organizados según las fases del laboratorio. Cada entrada incluye: la técnica aplicada, el prompt (o su forma resumida) y la respuesta clave del LLM que impactó el diseño final.

---

## Fase 1 — Diseño y Definición de Prompts

### Prompt 1.1 — Definición de Contexto / Persona (Rol del modelo)

**Técnica:** Persona + Contexto de sistema.

```
Eres un Desarrollador Backend Senior especializado en microservicios y en
Node.js/TypeScript. Vas a actuar como mi Pair Programmer para construir el
"Carbon Tracker Service" de la empresa de logística EcoLogistics.

Stack obligatorio:
- Node.js + TypeScript + Express
- Jest + Supertest para testing
- Arquitectura en capas: dominio (lógica de negocio pura) separado de
  controladores/rutas (capa HTTP)

Estándares de codificación exigidos:
- Principios SOLID (en particular: responsabilidad única y bajo acoplamiento
  entre lógica de negocio y framework HTTP)
- Código limpio: nombres explícitos, funciones pequeñas, sin efectos
  colaterales ocultos
- Manejo de errores explícito con tipos de error de dominio, no con strings
  ni excepciones genéricas
- Validación estricta de datos de entrada en el borde del sistema
- Comentarios solo cuando expliquen el "por qué", nunca el "qué"

No escribas código todavía. Primero quiero que razones el diseño.
```

**Respuesta clave del LLM (resumen):** confirmó el rol y propuso una estructura de carpetas en 4 capas (`domain`, `controllers`, `routes`, `middleware`), señalando que la capa `domain` no debía importar nada de `express` para mantenerla testeable de forma aislada y cumplir el Principio de Inversión de Dependencias (SOLID).

---

### Prompt 1.2 — Chain-of-Thought: razonar la lógica antes de codificar

**Técnica:** Chain-of-Thought (Cadena de Pensamiento).

```
Antes de escribir una sola línea de código, razona paso a paso el diseño de
la función de cálculo de huella de carbono:

Paso 1: ¿Qué variables de entrada son estrictamente necesarias y cuál es su
        tipo/rango válido? (tipo de vehículo, peso de carga en toneladas,
        distancia en km, factor de eficiencia)
Paso 2: ¿Qué fórmula matemática relaciona esas variables con las emisiones
        de CO2? Justifica las unidades.
Paso 3: ¿Qué constante o factor depende del tipo de vehículo (Eléctrico,
        Diésel, Híbrido) y por qué varía entre ellos?
Paso 4: ¿Qué casos de entrada son inválidos o límite, y qué debería hacer el
        sistema en cada uno (rechazar, devolver 0, etc.)?
Paso 5: Recién con lo anterior, propone la firma de la función principal.

Muéstrame tu razonamiento explícitamente antes de proponer la firma final.
```

**Respuesta clave del LLM (resumen del razonamiento obtenido):**

1. **Variables necesarias:** `vehicleType` (enum cerrado), `cargoWeightTons` (número > 0), `distanceKm` (número ≥ 0), `efficiencyFactor` (número > 0, multiplicador sobre el factor base).
2. **Fórmula propuesta:** `CO2_kg = distancia_km × peso_toneladas × factor_emisión(vehículo) × factor_eficiencia`. Unidades: el factor de emisión se expresa en **kg CO2 por tonelada-kilómetro (kg/ton·km)**, un estándar común en reportes de transporte de carga (p. ej. GLEC Framework), de modo que al multiplicar por toneladas y km el resultado queda directamente en kg de CO2.
3. **Factor por tipo de vehículo:** Diésel tiene el factor más alto por quemar combustible fósil directamente; Híbrido es intermedio por combinar motor térmico y eléctrico; Eléctrico es el más bajo porque no genera emisión directa de escape (aunque no es cero, por la generación eléctrica upstream). Se modela como una tabla de constantes (`Record<VehicleType, number>`), fácilmente ajustable con datos reales de la flota sin tocar la lógica de cálculo.
4. **Casos límite identificados:** distancia 0 → 0 kg de CO2 (es un resultado válido, no un error); peso ≤ 0 → error de validación; distancia < 0 → error; factor de eficiencia ≤ 0 o valores absurdamente altos → error; tipo de vehículo fuera del enum soportado → error específico (`UnsupportedVehicleTypeError`), distinto del error de validación genérico, para que la API pueda comunicar con precisión qué fue lo que falló.
5. **Firma propuesta:** `calculateCarbonFootprint(input: EmissionInput): EmissionResult`, que internamente delega la validación a una función separada (`validateEmissionInput`) antes de aplicar la fórmula — separando "validar" de "calcular" como responsabilidades distintas.

Esta salida guió directamente el diseño final en `src/domain/carbonCalculator.ts` y `src/domain/validators.ts`.

---

## Fase 2 — Implementación Asistida

### Prompt 2.1 — Función principal de cálculo

**Técnica:** Instrucción directa (zero-shot), apoyada en el razonamiento ya generado en 1.2.

```
Con el razonamiento anterior, implementa `calculateCarbonFootprint` en
TypeScript. Debe:
- Recibir un objeto crudo (posiblemente inválido, como vendría de un body
  HTTP) y devolver un resultado tipado.
- No lanzar excepciones genéricas: usar clases de error de dominio.
- No mezclar validación de tipos con la fórmula matemática en la misma
  función (separar responsabilidades).
```

**Resultado:** primera versión de `carbonCalculator.ts` + `validators.ts` + `errors.ts`, con la fórmula y una validación básica (solo "campo requerido").

---

### Prompt 2.2 — Iterative Refinement: manejo de errores y validación de datos

**Técnica:** Refinamiento Iterativo (múltiples rondas sobre el mismo código).

**Ronda 1 (crítica al LLM):**
```
Revisa la validación actual. ¿Qué pasa si `cargoWeightTons` es un string en
vez de number? ¿Qué pasa si es NaN o Infinity? ¿Qué pasa si el vehicleType
viene en minúsculas o con espacios? Corrige la validación para blindarla
contra estos casos, sin usar `any`.
```
**Cambio resultante:** se agregó `isFiniteNumber` (type guard estricto con `Number.isFinite`) y normalización de `vehicleType` (`trim().toUpperCase()`) antes de comparar contra el enum.

**Ronda 2 (crítica al LLM):**
```
¿Qué pasa si cargoWeightTons o distanceKm son técnicamente válidos pero
absurdos para un caso de logística real (por ejemplo 10 millones de
toneladas)? Un microservicio de producción no debería aceptar eso sin
límite. Propone cotas razonables y agrégalas a la validación con mensajes
de error claros.
```
**Cambio resultante:** se agregaron límites superiores (`MAX_CARGO_WEIGHT_TONS`, `MAX_DISTANCE_KM`, `MAX_EFFICIENCY_FACTOR`) con mensajes de error descriptivos por campo.

**Ronda 3 (crítica al LLM):**
```
El body de un request HTTP puede no ser ni siquiera un objeto (puede venir
null, un string, o un array). Verifica que la función de validación
contemple ese caso antes de acceder a sus propiedades.
```
**Cambio resultante:** se agregó la guarda `rawInput === null || typeof rawInput !== 'object'` al inicio de `validateEmissionInput`.

---

### Prompt 2.3 — Modularización: separar lógica de negocio de los controladores

**Técnica:** Instrucción directa + revisión de arquitectura.

```
Ahora separa esto en capas para exponerlo como API REST con Express:
- Un controlador que solo traduzca HTTP <-> dominio (sin lógica de negocio).
- Un router que registre la ruta POST /api/carbon-footprint.
- Un middleware de errores centralizado que traduzca las excepciones de
  dominio a códigos de estado HTTP.
- Un archivo app.ts que arme la app de Express de forma testeable
  (sin llamar a .listen()), y un server.ts que sí la levante.

Propón la estructura de carpetas antes de escribir el código.
```

**Respuesta clave del LLM:** propuso exactamente la estructura `domain/ | controllers/ | routes/ | middleware/ | app.ts | server.ts`, remarcando que separar `app.ts` de `server.ts` es lo que permite testear la API completa con Supertest sin abrir un puerto real — decisión que se refleja en `tests/routes/carbonRoutes.test.ts`.

---

## Fase 3 — Calidad y Pruebas

### Prompt 3.1 — Generación de pruebas unitarias (con ejemplos guía)

**Técnica:** Few-shot (se dieron 2 ejemplos de casos ya cubiertos como patrón) + instrucción de cobertura de bordes.

```
Genera la suite de pruebas con Jest para `calculateCarbonFootprint`.
Sigue este patrón para cada caso (ejemplo ya resuelto):

it('calcula correctamente para DIESEL', () => {
  const result = calculateCarbonFootprint({ vehicleType: 'DIESEL',
    cargoWeightTons: 10, distanceKm: 100, efficiencyFactor: 1 });
  expect(result.co2EmissionsKg).toBe(62);
});

it('rechaza tipos de vehículo no soportados', () => {
  expect(() => calculateCarbonFootprint({ vehicleType: 'GASOLINE', ... }))
    .toThrow(UnsupportedVehicleTypeError);
});

Ahora, con ese mismo patrón, cubre TODOS estos casos de borde:
distancia cero, carga negativa, carga igual a cero, carga por encima de un
límite razonable, distancia negativa, factor de eficiencia cero/negativo/
excesivo, valores NaN/Infinity, tipos de dato incorrectos (string en vez de
number), body nulo, y tipo de vehículo vacío o no soportado.
```

**Resultado:** `tests/domain/carbonCalculator.test.ts` (21 casos) + `tests/routes/carbonRoutes.test.ts` (integración HTTP) + `tests/middleware/errorHandler.test.ts`, alcanzando **100% de cobertura** de statements/branches/functions/lines (verificado con `npm test`, umbral configurado en 90% en `jest.config.js`).

---

### Prompt 3.2 — Code Review crítico (sesión nueva, enfoque en seguridad y rendimiento)

**Técnica:** Self-Critique / Consistency, simulando una **segunda sesión independiente** del LLM que no conoce el razonamiento previo, actuando como revisor adversarial.

```
Actúa como un revisor de código senior especializado en seguridad y
rendimiento. Te paso el código completo del microservicio (dominio,
controladores, rutas, middleware) SIN contexto adicional. No asumas que el
autor tomó buenas decisiones.

Evalúa específicamente:
1. Seguridad: ¿hay inyección, DoS por payloads maliciosos, fuga de
   información en mensajes de error, validación insuficiente de tipos?
2. Rendimiento: ¿hay cálculos redundantes, validaciones que se puedan
   simplificar, uso de estructuras de datos O(n) evitables?
3. Manejo de errores: ¿se distingue error de cliente (4xx) de error de
   servidor (5xx) de forma consistente?

Da hallazgos concretos, no comentarios genéricos.
```

**Hallazgos devueltos por el LLM y acción tomada:**

| # | Hallazgo | Severidad | Acción |
|---|---|---|---|
| 1 | Sin límites superiores en `cargoWeightTons` / `distanceKm` / `efficiencyFactor`, un cliente podría enviar `Number.MAX_VALUE` y provocar resultados sin sentido o abrir la puerta a payloads pensados para forzar overflow en cálculos aguas abajo. | Media | Se agregaron cotas máximas explícitas en `validators.ts` (ver Prompt 2.2, ronda 2). |
| 2 | Un `SyntaxError` de `body-parser` ante JSON malformado no estaba contemplado en `errorHandler`, y caía al branch de error 500 exponiendo un `console.error` de un error de cliente como si fuera un fallo interno. | Media | Se añadió detección explícita de `SyntaxError` de body-parser (`entity.parse.failed`) para responder `400` en vez de `500`, evitando "ruido" de errores de cliente clasificados como fallos de servidor. |
| 3 | Los mensajes de error no exponen stack traces ni detalles internos al cliente (solo `error` + `message` controlados); los errores no controlados sí se loguean server-side pero no se filtran al response. | — (correcto, sin acción) | Se mantiene: es la práctica correcta para no filtrar información interna. |
| 4 | La tabla de factores de emisión es una constante `Readonly<Record<...>>` en memoria, sin I/O ni queries por request → sin problema de rendimiento en el cálculo en sí; el único costo real es el `JSON.parse` del body, inherente a cualquier API REST. | — (correcto, sin acción) | Confirmado, no requiere cambios. |
| 5 | El uso de `Object.setPrototypeOf` en `DomainError` es necesario en TS/JS al extender `Error` en target ES2020 para que `instanceof` funcione correctamente tras compilar; sin esto, `errorHandler` podría fallar en distinguir `DomainError` de un error genérico. | Alta (correctitud, no solo estilo) | Se mantiene la línea existente; se documentó el motivo en este registro para que no se elimine por "limpieza" en el futuro. |

Este ciclo de auto-crítica (generar → revisar en una sesión nueva → corregir) es el que llevó la validación de básica a robusta, y es la evidencia del **Refinamiento Iterativo post-revisión** exigido por la rúbrica.
