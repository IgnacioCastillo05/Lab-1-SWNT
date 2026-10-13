# Bitácora — EcoTrack AI (Capstone: De la Idea a la Realidad con Vibe Coding)

**Caso:** EcoTrack AI, MVP para que pequeños negocios calculen su huella de carbono describiendo su día en lenguaje natural o chat.
**Herramienta de Vibe Coding usada:** Claude Code (mismo rol que Cursor/Replit Agent/Bolt.new describen en el enunciado: agente que recibe instrucciones de alto nivel y genera/itera el código completo).

## 1. Definición del "Vibe" y Prompting Inicial

El Master Prompt completo está en `docs/master-prompt.md`. Resumen de las decisiones de personalidad/flujo que fijó: interfaz de **chat** (no formulario con campos sueltos — así reduce la fricción que el enunciado identifica como el problema real: "no tienen tiempo para llenar formularios complejos"); arquitectura en 3 capas testeables; y la capa de IA diseñada con contrato real/simulado desde el día 1, no como parche posterior.

## 2. Desarrollo Iterativo

### Generación de frontend + lógica básica

A partir del Master Prompt se generaron `app/activity_extractor.py` (texto libre → actividades estructuradas: vehículos, electricidad, combustible, gas, residuos), `app/emissions_calculator.py` (factores de emisión explícitos por categoría) y `app/streamlit_app.py` (interfaz de chat que conecta ambos). Verificado end-to-end: la app levanta con `streamlit run` y responde HTTP 200; el ejemplo exacto del enunciado ("Hoy usamos 5 camionetas de reparto y gastamos 200kWh de luz") se detecta y calcula correctamente (test `test_example_from_the_assignment_prompt`, verde).

### Funcionalidad de IA implementada

`app/ai_insights.py` implementa el "análisis inmediato" pedido en el enunciado: identifica la categoría de mayor contribución y genera una recomendación específica en lenguaje natural (ej. "Tu principal fuente de emisiones hoy fue electricidad (80 kg CO2e, 57% del total). Revisá si podés migrar a un proveedor de energía renovable."). Implementa el patrón real/simulado explícitamente permitido por el enunciado ("puede ser simulada o real"): si existe `ANTHROPIC_API_KEY` en el entorno, construye un prompt estructurado y llama a la API de Claude; si no, usa un generador determinístico con el mismo contrato de salida. **Transparencia:** la ruta con API real no fue ejecutada en esta entrega por no contar con una API key en este entorno de desarrollo — el código está completo y documentado, pero solo la ruta simulada fue probada con tests.

### Refinamiento del diseño en lenguaje natural

Prompt de iteración estética:
```
Haz que el diseño sea más minimalista y use tonos verdes. No quiero CSS
custom complicado, usá lo que Streamlit ya ofrece para temas.
```
**Resultado:** `.streamlit/config.toml` con una paleta verde (`primaryColor #2E7D32`, fondo `#F6F8F5`) aplicada automáticamente por Streamlit sin tocar el código de la interfaz — la IA eligió la vía de configuración declarativa en vez de CSS inyectado, que es más mantenible y es exactamente el tipo de decisión técnica que valida delegar el "cómo" y no solo el "qué".

## 3. Resolución de Problemas (Debugging con IA)

Se corrieron los 16 tests antes de dar por cerrada la primera versión, y aparecieron **2 fallas reales** (no hipotéticas — es el output real de `pytest`):

**Bug 1 — tipo de combustible ignorado:** el parser capturaba correctamente los litros de combustible, pero el código nunca leía qué tipo de combustible decía el texto (`match.group(2)`), así que todo quedaba costeado con el factor de diésel aunque el texto dijera "gasolina". Se le describió el síntoma al agente sin proponer la solución: *"el test espera que 100 litros de gasolina no se calculen igual que 100 litros de diesel, y están dando el mismo resultado"*. El fix fue leer el grupo capturado y asignarlo a `fuel_type` en vez de dejar el valor por defecto del dataclass.

**Bug 2 — plural mal recortado:** `"camiones".rstrip("s")` producía `"camione"` en vez de `"camion"`, porque el plural de "camión" agrega "es", no solo "s" — un caso que `rstrip` no puede resolver de forma genérica. Se encontró porque el test `test_multiple_vehicle_types_in_one_sentence` fallaba comparando `{'camione', 'moto'}` contra `{'camion', 'moto'}`. El fix fue reemplazar el recorte genérico por un diccionario explícito plural→singular para el vocabulario cerrado de vehículos soportados, más robusto que intentar generalizar reglas de pluralización en español.

Ambos bugs se corrigieron sin editar el regex "a mano buscando a ojo": se describió el comportamiento esperado vs. observado (lo que el test ya hacía explícito) y se dejó que el agente proponga el fix, que en el caso 2 fue una solución distinta (mapeo explícito) a la que un ajuste rápido de regex hubiera producido.

## 4. Presentación del Producto — Vibe Coding vs. desarrollo tradicional

Estimación comparativa para este MVP concreto (3 módulos de lógica + interfaz de chat + 16 tests + theming):

| Etapa | Desarrollo tradicional (manual) | Vibe Coding (este proyecto) |
|---|---|---|
| Diseñar arquitectura de 3 capas | 30-45 min pensando + documentando | Incluido en el Master Prompt, ~5 min |
| Escribir parser + regex de 5 categorías | 1-2 horas (incluye iterar regex a mano) | Generado en un prompt, iterado en 2 rondas de bugs reales (~15 min) |
| Suite de 16 tests | 45-60 min | Generados junto con la lógica, ~10 min de revisión |
| Interfaz de chat + theming | 30-40 min (Streamlit es rápido, pero el chat + CSS manual toma tiempo) | Un prompt de estética, aplicado vía config declarativo, ~5 min |
| **Total aproximado** | **~3-4 horas** | **~35-40 min** |

La aceleración no vino de "escribir menos código" — el código generado es equivalente en tamaño al que escribiría a mano. Vino de **no tener que recordar sintaxis de regex, de Streamlit, ni de pytest** mientras se piensa en el producto, y de que describir un bug en una frase fue más rápido que depurarlo línea por línea. El costo real de la vibración creativa no es "menos trabajo", es trasladar el trabajo de "cómo se escribe esto" a "qué necesito que haga y cómo sé que lo hizo bien" — y esa segunda pregunta la sigue respondiendo un humano, revisando tests y corriendo la app, no delegándola a ciegas.
