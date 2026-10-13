"""
EcoTrack AI — Interfaz tipo chat para pequeños negocios.

Ejecutar localmente:
    streamlit run parteD/app/streamlit_app.py
"""

import sys
from pathlib import Path

import streamlit as st

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.activity_extractor import extract_activities, has_any_activity  # noqa: E402
from app.ai_insights import generate_insight  # noqa: E402
from app.emissions_calculator import (  # noqa: E402
    calculate_electricity_emissions,
    calculate_fuel_emissions,
    calculate_natural_gas_emissions,
    calculate_vehicle_emissions,
    calculate_waste_emissions,
)

st.set_page_config(page_title="EcoTrack AI", page_icon="🌱", layout="centered")

if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

st.title("🌱 EcoTrack AI")
st.caption("Contanos qué hizo tu negocio hoy. Nosotros calculamos la huella de carbono y te damos un análisis.")

for message in st.session_state.chat_history:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

user_text = st.chat_input('Ej: "Hoy usamos 5 camionetas de reparto y gastamos 200kWh de luz"')

if user_text:
    st.session_state.chat_history.append({"role": "user", "content": user_text})
    with st.chat_message("user"):
        st.markdown(user_text)

    activities = extract_activities(user_text)

    if not has_any_activity(activities):
        response = (
            "No reconocí actividades en ese mensaje. Probá mencionar vehículos "
            "(ej. '3 camionetas'), electricidad en kWh, litros de combustible, "
            "m3 de gas, o kg de residuos."
        )
    else:
        items = []
        for vehicle in activities.vehicles:
            items.append(calculate_vehicle_emissions(vehicle.count, vehicle.vehicle_type))
        if activities.electricity_kwh is not None:
            items.append(calculate_electricity_emissions(activities.electricity_kwh))
        if activities.fuel_liters is not None:
            items.append(calculate_fuel_emissions(activities.fuel_liters, activities.fuel_type))
        if activities.natural_gas_m3 is not None:
            items.append(calculate_natural_gas_emissions(activities.natural_gas_m3))
        if activities.waste_kg is not None:
            items.append(calculate_waste_emissions(activities.waste_kg))

        total_co2_kg = round(sum(item.co2_kg for item in items), 2)
        insight = generate_insight(items, total_co2_kg)

        breakdown_lines = "\n".join(f"- {item.description}: **{item.co2_kg} kg CO2e**" for item in items)
        response = (
            f"**Huella estimada de hoy: {total_co2_kg} kg CO2e**\n\n"
            f"{breakdown_lines}\n\n"
            f"🤖 *Análisis:* {insight}"
        )

    st.session_state.chat_history.append({"role": "assistant", "content": response})
    with st.chat_message("assistant"):
        st.markdown(response)
