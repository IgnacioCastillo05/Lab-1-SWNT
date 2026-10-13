"""
Motor de estimación de huella de carbono a partir de una frase en lenguaje
natural (español), tipo "Hoy comí carne y viajé 20km en bus".

No es un NLP "real" (no usa un LLM en runtime): es un parser basado en
reglas (regex + diccionarios de palabras clave) suficiente para el MVP.
Los factores de emisión son valores ilustrativos de órdenes de magnitud
reales (estilo life-cycle assessment), pensados para demostrar el flujo
completo, no para uso en reportes de cumplimiento normativo.
"""

import re
from dataclasses import dataclass, field

# kg CO2e por km recorrido, por modo de transporte.
TRANSPORT_EMISSION_FACTORS_KG_PER_KM: dict[str, float] = {
    "auto": 0.192,
    "carro": 0.192,
    "coche": 0.192,
    "moto": 0.103,
    "motocicleta": 0.103,
    "bus": 0.105,
    "colectivo": 0.105,
    "metro": 0.041,
    "tren": 0.041,
    "avion": 0.255,
    "avión": 0.255,
    "bici": 0.0,
    "bicicleta": 0.0,
    "caminando": 0.0,
    "caminata": 0.0,
}

# kg CO2e por porción, por tipo de comida (simplificación "por comida").
FOOD_EMISSION_FACTORS_KG_PER_SERVING: dict[str, float] = {
    "carne": 6.61,
    "res": 6.61,
    "carne de res": 6.61,
    "cerdo": 3.75,
    "pollo": 1.57,
    "pescado": 1.34,
    "vegetariano": 0.84,
    "vegetariana": 0.84,
    "verduras": 0.84,
    "ensalada": 0.84,
    "vegano": 0.59,
    "vegana": 0.59,
}

_TRANSPORT_PATTERN = re.compile(
    r"(\d+(?:[.,]\d+)?)\s*km\s*(?:en|por|con)?\s*(" + "|".join(TRANSPORT_EMISSION_FACTORS_KG_PER_KM) + r")",
    re.IGNORECASE,
)


@dataclass
class EmissionItem:
    description: str
    category: str  # "transporte" | "alimentacion"
    co2_kg: float


@dataclass
class EstimationResult:
    items: list[EmissionItem] = field(default_factory=list)
    total_co2_kg: float = 0.0
    unrecognized_text: bool = False


def _extract_transport_items(text: str) -> list[EmissionItem]:
    items = []
    for match in _TRANSPORT_PATTERN.finditer(text):
        distance_km = float(match.group(1).replace(",", "."))
        mode = match.group(2).lower()
        factor = TRANSPORT_EMISSION_FACTORS_KG_PER_KM[mode]
        co2_kg = round(distance_km * factor, 2)
        items.append(
            EmissionItem(
                description=f"{distance_km:g} km en {mode}",
                category="transporte",
                co2_kg=co2_kg,
            )
        )
    return items


def _extract_food_items(text: str) -> list[EmissionItem]:
    normalized = text.lower()
    items = []
    seen_spans: list[tuple[int, int]] = []

    # Se ordenan las claves más largas primero para que "carne de res" no
    # quede parcialmente capturada por "carne" antes de probar la frase completa.
    for keyword in sorted(FOOD_EMISSION_FACTORS_KG_PER_SERVING, key=len, reverse=True):
        for match in re.finditer(rf"\b{re.escape(keyword)}\b", normalized):
            span = match.span()
            if any(span[0] >= s and span[1] <= e for s, e in seen_spans):
                continue
            seen_spans.append(span)
            co2_kg = FOOD_EMISSION_FACTORS_KG_PER_SERVING[keyword]
            items.append(
                EmissionItem(
                    description=f"comida: {keyword}",
                    category="alimentacion",
                    co2_kg=co2_kg,
                )
            )
    return items


def estimate_co2(text: str) -> EstimationResult:
    """Estima la huella de carbono (kg CO2e) a partir de una frase en lenguaje natural."""
    if not text or not text.strip():
        return EstimationResult(items=[], total_co2_kg=0.0, unrecognized_text=True)

    transport_items = _extract_transport_items(text)
    food_items = _extract_food_items(text)
    all_items = transport_items + food_items

    total = round(sum(item.co2_kg for item in all_items), 2)
    return EstimationResult(
        items=all_items,
        total_co2_kg=total,
        unrecognized_text=len(all_items) == 0,
    )
