"""
Extractor de actividades de negocio a partir de texto libre — EcoTrack AI.

Esta es la capa que, en producción, podría delegarse a una API de IA real
(ver ai_insights.py para el patrón real/simulado). Para el MVP se resuelve
con reglas (regex + keywords), documentado así en la bitácora: es una capa
de "IA simulada" cuyo contrato (texto libre -> datos estructurados) es
idéntico al que tendría una llamada real a un LLM.
"""

import re
from dataclasses import dataclass, field

_VEHICLE_PATTERN = re.compile(
    r"(\d+)\s*(camionetas?|camiones?|furgonetas?|autos?|motos?)",
    re.IGNORECASE,
)

# Plural -> singular explícito. rstrip("s") no alcanza: "camiones" ->
# "camion" pierde la "e" (queda "camione"), porque el plural de "camión"
# agrega "es", no solo "s". Bug real detectado al correr los tests (ver
# docs/bitacora.md, "Resolución de Problemas").
_VEHICLE_SINGULAR_BY_PLURAL: dict[str, str] = {
    "camionetas": "camioneta",
    "camioneta": "camioneta",
    "camiones": "camion",
    "camion": "camion",
    "furgonetas": "furgoneta",
    "furgoneta": "furgoneta",
    "autos": "auto",
    "auto": "auto",
    "motos": "moto",
    "moto": "moto",
}
_ELECTRICITY_PATTERN = re.compile(r"(\d+(?:[.,]\d+)?)\s*kwh", re.IGNORECASE)
_FUEL_PATTERN = re.compile(
    r"(\d+(?:[.,]\d+)?)\s*(?:litros|lts|l)\s*(?:de)?\s*(diesel|diésel|gasolina)",
    re.IGNORECASE,
)
_GAS_PATTERN = re.compile(r"(\d+(?:[.,]\d+)?)\s*m3\s*(?:de)?\s*gas", re.IGNORECASE)
_WASTE_PATTERN = re.compile(r"(\d+(?:[.,]\d+)?)\s*(?:kg|kilos?)\s*(?:de)?\s*(?:residuos|basura|desechos)", re.IGNORECASE)


@dataclass
class ExtractedVehicleUsage:
    count: int
    vehicle_type: str


@dataclass
class ExtractedActivities:
    vehicles: list[ExtractedVehicleUsage] = field(default_factory=list)
    electricity_kwh: float | None = None
    fuel_liters: float | None = None
    fuel_type: str = "diesel"
    natural_gas_m3: float | None = None
    waste_kg: float | None = None


def _normalize_number(raw: str) -> float:
    return float(raw.replace(",", "."))


def extract_activities(text: str) -> ExtractedActivities:
    """Parsea una frase en lenguaje natural sobre actividades de negocio."""
    result = ExtractedActivities()

    for match in _VEHICLE_PATTERN.finditer(text):
        count = int(match.group(1))
        raw_type = match.group(2).lower()
        vehicle_type = _VEHICLE_SINGULAR_BY_PLURAL.get(raw_type, raw_type)
        result.vehicles.append(ExtractedVehicleUsage(count=count, vehicle_type=vehicle_type))

    electricity_match = _ELECTRICITY_PATTERN.search(text)
    if electricity_match:
        result.electricity_kwh = _normalize_number(electricity_match.group(1))

    fuel_match = _FUEL_PATTERN.search(text)
    if fuel_match:
        result.fuel_liters = _normalize_number(fuel_match.group(1))
        # FIX: se lee match.group(2) en vez de dejar el default "diesel" del
        # dataclass — el bug original costeaba gasolina con el factor de
        # diesel (ver docs/bitacora.md, "Resolución de Problemas").
        result.fuel_type = fuel_match.group(2).lower()

    gas_match = _GAS_PATTERN.search(text)
    if gas_match:
        result.natural_gas_m3 = _normalize_number(gas_match.group(1))

    waste_match = _WASTE_PATTERN.search(text)
    if waste_match:
        result.waste_kg = _normalize_number(waste_match.group(1))

    return result


def has_any_activity(activities: ExtractedActivities) -> bool:
    return bool(
        activities.vehicles
        or activities.electricity_kwh
        or activities.fuel_liters
        or activities.natural_gas_m3
        or activities.waste_kg
    )
