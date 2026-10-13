# EcoTrack AI — MVP (Proyecto Integrador Capstone: Vibe Coding)

Chat donde un pequeño negocio describe su día (ej. "Hoy usamos 5 camionetas de reparto y gastamos 200kWh de luz") y recibe el desglose de su huella de carbono más un análisis en lenguaje natural con una recomendación.

## Contenido

```
.streamlit/config.toml            → Tema minimalista verde (resultado de iteración de diseño, ver docs/bitacora.md)
app/
├── activity_extractor.py         → Texto libre → actividades estructuradas (capa "IA simulada")
├── emissions_calculator.py       → Factores de emisión explícitos por categoría
├── ai_insights.py                → Funcionalidad de IA: análisis en lenguaje natural (real/simulado)
└── streamlit_app.py              → Interfaz de chat (st.chat_message/st.chat_input)
tests/                            → 16 tests pytest, todos verdes
docs/
├── master-prompt.md              → El Master Prompt completo (Fase 1)
├── bitacora.md                   → Documento principal: prompts, IA implementada, debugging real, vibe vs. tradicional
└── screenshots-y-video.md        → Por qué no hay captura/video real en esta entrega (ver nota abajo)
requirements.txt
```

## Cómo correrlo

```bash
cd parteD
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m pytest tests/ -v              # 16 passed
streamlit run app/streamlit_app.py       # abre en http://localhost:8501
```

Opcional: para activar el análisis con IA real en vez del simulado, exportá `ANTHROPIC_API_KEY` antes de correr la app (ver `app/ai_insights.py`). Sin esa variable, la app funciona igual con el generador simulado.

## Nota de transparencia

Este MVP fue generado por un agente de código sin interfaz gráfica. Todo lo que es código, lógica de IA, tests y documentación está hecho, corrido y verificado de verdad (incluyendo 2 bugs reales encontrados con pytest y corregidos, documentados en `docs/bitacora.md`). Las capturas de pantalla y el video demo del enunciado requieren una sesión real de Streamlit en una pantalla — ver `docs/screenshots-y-video.md` para los pasos exactos de cómo generarlos.
