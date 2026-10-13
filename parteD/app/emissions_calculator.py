"""
Calculadora de huella de carbono para pequeños negocios — EcoTrack AI.

Factores ilustrativos (kg CO2e), misma filosofía que en Parte A/C: órdenes
de magnitud reales tipo life-cycle assessment, pensados para demostrar el
flujo de producto completo, no para reportes de cumplimiento normativo.
"""

from dataclasses import dataclass

# kg CO2e por vehículo-día en uso (ruta urbana corta típica), por tipo.
VEHICLE_EMISSION_FACTORS_KG_PER_DAY: dict[str, float] = {
    "camioneta": 12.0,
    "camion": 28.0,
    "camión": 28.0,
    "furgoneta": 15.0,
    "auto": 6.5,
    "moto": 2.8,
}

ELECTRICITY_EMISSION_FACTOR_KG_PER_KWH = 0.40
NATURAL_GAS_EMISSION_FACTOR_KG_PER_M3 = 2.00
WASTE_EMISSION_FACTOR_KG_PER_KG = 0.50

FUEL_EMISSION_FACTORS_KG_PER_LITER: dict[str, float] = {
    "diesel": 2.68,
    "diésel": 2.68,
    "gasolina": 2.31,
}


@dataclass
class EmissionItem:
    description: str
    category: str
    co2_kg: float


def calculate_vehicle_emissions(count: int, vehicle_type: str) -> EmissionItem:
    factor = VEHICLE_EMISSION_FACTORS_KG_PER_DAY.get(vehicle_type.lower(), VEHICLE_EMISSION_FACTORS_KG_PER_DAY["camioneta"])
    co2_kg = round(count * factor, 2)
    return EmissionItem(description=f"{count} {vehicle_type}(s) en uso hoy", category="transporte", co2_kg=co2_kg)


def calculate_electricity_emissions(kwh: float) -> EmissionItem:
    co2_kg = round(kwh * ELECTRICITY_EMISSION_FACTOR_KG_PER_KWH, 2)
    return EmissionItem(description=f"{kwh:g} kWh de electricidad", category="electricidad", co2_kg=co2_kg)


def calculate_fuel_emissions(liters: float, fuel_type: str) -> EmissionItem:
    factor = FUEL_EMISSION_FACTORS_KG_PER_LITER.get(fuel_type.lower(), FUEL_EMISSION_FACTORS_KG_PER_LITER["diesel"])
    co2_kg = round(liters * factor, 2)
    return EmissionItem(description=f"{liters:g} litros de {fuel_type}", category="combustible", co2_kg=co2_kg)


def calculate_natural_gas_emissions(cubic_meters: float) -> EmissionItem:
    co2_kg = round(cubic_meters * NATURAL_GAS_EMISSION_FACTOR_KG_PER_M3, 2)
    return EmissionItem(description=f"{cubic_meters:g} m3 de gas natural", category="gas", co2_kg=co2_kg)


def calculate_waste_emissions(kilograms: float) -> EmissionItem:
    co2_kg = round(kilograms * WASTE_EMISSION_FACTOR_KG_PER_KG, 2)
    return EmissionItem(description=f"{kilograms:g} kg de residuos", category="residuos", co2_kg=co2_kg)
