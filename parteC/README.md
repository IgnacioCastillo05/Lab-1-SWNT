# EcoTrack — MVP (Proyecto Integrador: Vibe Coding)

Prototipo funcional: el usuario escribe en lenguaje natural lo que hizo en su día (ej. "Hoy comí carne y viajé 20km en bus") y la app estima su huella de carbono (kg CO2e), con desglose por actividad.

## Contenido

```
.cursorrules                      → Reglas del agente de IA para este proyecto (Fase 1)
app/
├── co2_estimator.py               → Lógica de negocio pura: parser de texto + cálculo de CO2
└── streamlit_app.py               → Interfaz Streamlit (consume co2_estimator, sin lógica propia)
tests/
└── test_co2_estimator.py          → 8 tests pytest, todos verdes
docs/
├── prompts-log.md                 → Prompts del "vibe" usados para construir la app (Fase 2)
├── vibe-report.md                 → Reflexión del proceso, 494 palabras (Fase 3)
└── deployment-instructions.md     → Pasos manuales pendientes: Cursor, Replit, captura (ver nota abajo)
screenshots/
└── README.md                      → Explica por qué la captura real queda pendiente de tu lado
requirements.txt
```

## Cómo correrlo localmente

```bash
cd parteC
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m pytest tests/ -v            # 8 passed
streamlit run app/streamlit_app.py     # abre en http://localhost:8501
```

Ambos comandos fueron ejecutados y verificados antes de esta entrega: la suite de tests pasa completa y la app Streamlit levanta y responde `200 OK`.

## Nota importante sobre el alcance de esta entrega

Este proyecto fue generado por un agente de código (Claude Code) corriendo en un contenedor cloud sin interfaz gráfica. Eso significa que **todo lo que es código, lógica, tests y documentación está hecho y verificado**, pero **instalar Cursor, crear una cuenta de Replit, desplegar ahí y tomar una captura de pantalla son pasos que solo pueden hacerse desde tu propia máquina** — no por falta de esfuerzo, sino porque ningún agente sin GUI puede ejecutar esas acciones. `docs/deployment-instructions.md` tiene el paso a paso exacto para completarlos en minutos.
