# Master Prompt — EcoTrack AI

Prompt inicial entregado al agente de IA (Composer/Chat), definiendo visión técnica y estética completas antes de generar una sola línea de código.

```
Eres mi copiloto de desarrollo para construir el MVP de "EcoTrack AI", una
herramienta para que pequeños negocios calculen su huella de carbono sin
llenar formularios complejos.

VISIÓN DEL PRODUCTO:
El dueño de un negocio escribe en una sola caja de chat una frase como
"Hoy usamos 5 camionetas de reparto y gastamos 200kWh de luz", y la app le
devuelve de inmediato: (1) el desglose de emisiones por actividad detectada,
y (2) un análisis en lenguaje natural que identifica su mayor fuente de
emisiones y le da una recomendación concreta — no solo números, una
interpretación útil para alguien sin conocimientos técnicos.

STACK Y ARQUITECTURA:
- Python + Streamlit, interfaz tipo CHAT (st.chat_message/st.chat_input),
  no un formulario tradicional con campos separados.
- Separá en 3 capas independientes y testeables sin levantar Streamlit:
  (a) extracción de actividades desde texto libre, (b) cálculo de
  emisiones por categoría con factores explícitos, (c) generación del
  análisis en lenguaje natural.
- La capa de análisis en lenguaje natural debe diseñarse para poder usar
  una API de IA real (Claude) SI hay una API key configurada, y caer a un
  generador simulado con el mismo contrato de salida si no la hay — nunca
  debe romper la experiencia del usuario por falta de credenciales.

ESTÉTICA:
Minimalista, tonos verdes (es una app de sostenibilidad), sin curvas de
aprendizaje: el usuario no debería necesitar instrucciones para usarla.

NO HAGAS TODAVÍA:
No agregues autenticación ni base de datos persistente. Esto es un MVP
para validar la idea con dueños de negocio reales, no el producto final.
```

**Por qué este prompt y no uno más corto:** el enunciado original del escenario ("quieren una interfaz tipo chat...") ya definía el problema de negocio, pero no la arquitectura ni el contrato de la capa de IA. Sin especificar "separá en 3 capas testeables" y "diseñá el contrato real/simulado desde el principio", el resultado típico de un prompt corto es una app donde todo vive en un solo archivo de Streamlit — funciona para la demo, pero no se puede testear ni swapear la IA simulada por una real sin reescribir media app. El Master Prompt resolvió eso de entrada, no como refactor posterior.
