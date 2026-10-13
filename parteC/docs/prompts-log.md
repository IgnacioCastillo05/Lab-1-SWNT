# Bitácora del "Vibe" — Fase 2 (Desarrollo)

Prompts usados con el agente de IA (en este proyecto, Claude Code actuando como el mismo tipo de copiloto que Cursor/Composer describe en el enunciado) para construir EcoTrack a partir de instrucciones de alto nivel, sin escribir cada línea manualmente.

## Prompt de arquitectura inicial (equivalente a Cmd+I / Composer)

```
Quiero un MVP de "EcoTrack": una app web simple donde el usuario escribe en
una sola caja de texto algo como "Hoy comí carne y viajé 20km en bus", y la
app le devuelve un estimado de su huella de carbono en kg de CO2, con el
desglose por actividad detectada. Usá Python + Streamlit (es lo más rápido
para validar la idea). Separá el parsing/cálculo de la interfaz para que
sea testeable. No uses base de datos: un historial en memoria de la sesión
alcanza para esta etapa.
```

**Resultado:** se generó `co2_estimator.py` (parser por regex + diccionarios de factores de emisión para transporte y alimentación) y `streamlit_app.py` (interfaz con formulario, resultado desglosado, e historial de sesión), siguiendo exactamente la separación de capas pedida.

## Iteración fluida ante errores (sin corrección manual)

Durante la primera versión del parser, la palabra "carne" dentro de la frase "carne de res" se contaba dos veces (una por "carne" y otra por "carne de res"), duplicando la emisión calculada. En vez de corregir el regex a mano, se describió el síntoma al agente:

```
Si escribo "comí carne de res", el resultado cuenta el CO2 de "carne" y el
de "carne de res" por separado, duplicando el valor. Debería contar una
sola vez la frase más específica. Arreglalo y agregá un test que lo cubra.
```

**Resultado:** el agente propuso ordenar las palabras clave por longitud descendente y descartar cualquier coincidencia más corta que caiga dentro del rango de una ya encontrada, agregando `test_longer_keyword_is_not_double_counted_by_shorter_substring` — que hoy pasa junto con el resto de la suite (8/8).

## Despliegue

```
Preparame el requirements.txt mínimo para correr esto en Replit, y
dejame instrucciones exactas de qué comando correr ahí para que quede
accesible por URL.
```

**Resultado:** `requirements.txt` con `streamlit` y `pytest`, y el comando de arranque documentado en `docs/deployment-instructions.md` (`streamlit run app/streamlit_app.py --server.port $PORT --server.address 0.0.0.0`, el patrón estándar para exponer Streamlit en un host como Replit).
