"""
EcoTrack — Prototipo MVP: registro de huella de carbono diaria por lenguaje natural.

Ejecutar localmente:
    streamlit run parteC/app/streamlit_app.py

Esta app es intencionalmente simple: un input de texto, un botón, y un
historial en memoria de la sesión (sin base de datos) — suficiente para
validar la idea de producto antes de invertir en infraestructura real.
"""

import sys
from datetime import datetime
from pathlib import Path

import streamlit as st

sys.path.insert(0, str(Path(__file__).resolve().parent))
from co2_estimator import estimate_co2  # noqa: E402

st.set_page_config(page_title="EcoTrack", page_icon="🌍", layout="centered")

if "history" not in st.session_state:
    st.session_state.history = []

st.title("🌍 EcoTrack")
st.caption("Registra tu día en lenguaje natural. Nosotros calculamos tu huella de carbono.")

with st.form("entry_form", clear_on_submit=True):
    entry_text = st.text_area(
        "¿Qué hiciste hoy?",
        placeholder='Ej: "Hoy comí carne y viajé 20km en bus"',
        height=80,
    )
    submitted = st.form_submit_button("Calcular huella de hoy")

if submitted:
    result = estimate_co2(entry_text)
    if result.unrecognized_text:
        st.warning(
            "No reconocí actividades en ese texto. Probá mencionar comidas "
            "(carne, pollo, pescado, vegetariano...) o trayectos con distancia "
            'y medio de transporte, ej: "viajé 15km en auto".'
        )
    else:
        st.session_state.history.append(
            {
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
                "text": entry_text,
                "result": result,
            }
        )
        st.success(f"Huella estimada: **{result.total_co2_kg} kg CO2e**")
        for item in result.items:
            st.write(f"- {item.description}: {item.co2_kg} kg CO2e ({item.category})")

if st.session_state.history:
    st.divider()
    st.subheader("Historial de hoy")
    running_total = 0.0
    for entry in reversed(st.session_state.history):
        running_total += entry["result"].total_co2_kg
        with st.expander(f'{entry["timestamp"]} — {entry["result"].total_co2_kg} kg CO2e'):
            st.write(entry["text"])
    st.metric("Total acumulado en esta sesión", f"{round(running_total, 2)} kg CO2e")
