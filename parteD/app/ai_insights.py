"""
Generación de insights en lenguaje natural — la funcionalidad de IA pedida
en el enunciado ("análisis inmediato" sobre las actividades descritas).

Patrón real/simulado: si hay una ANTHROPIC_API_KEY configurada en el
entorno, se usa el SDK de Anthropic para generar el análisis con un LLM
real; si no, se usa un generador simulado determinístico con el mismo
contrato de salida. Esto permite demostrar el punto de integración exacto
sin depender de credenciales para correr el MVP o sus tests.

IMPORTANTE (transparencia): la ruta con API real no fue ejecutada ni
verificada en esta entrega porque no hay una API key disponible en este
entorno de desarrollo. El código está completo y es el que se activaría
al configurar la variable de entorno; los tests cubren únicamente la ruta
simulada, que es la que corre el MVP por defecto.
"""

import os

from app.emissions_calculator import EmissionItem

_RECOMMENDATIONS_BY_CATEGORY: dict[str, str] = {
    "transporte": "Considerá optimizar rutas de reparto o evaluar vehículos eléctricos/híbridos para tu flota.",
    "electricidad": "Revisá si podés migrar a un proveedor de energía renovable o instalar paneles solares.",
    "combustible": "Evaluá mantenimiento preventivo de motores y rutas más cortas para reducir consumo.",
    "gas": "Revisá el aislamiento térmico del local para reducir el consumo de calefacción/calderas a gas.",
    "residuos": "Separar residuos para reciclaje puede reducir significativamente este componente de tu huella.",
}


def _build_prompt(items: list[EmissionItem], total_co2_kg: float) -> str:
    breakdown = "\n".join(f"- {item.description}: {item.co2_kg} kg CO2e ({item.category})" for item in items)
    return (
        "Eres un analista de sostenibilidad para pequeños negocios. Con el "
        "siguiente desglose de huella de carbono de HOY, escribí un análisis "
        "breve (máximo 3 oraciones) en español, identificando la categoría "
        "que más contribuye y una recomendación concreta y accionable para "
        "esa categoría específica. No repitas los números, interpretalos.\n\n"
        f"Desglose:\n{breakdown}\n\nTotal: {total_co2_kg} kg CO2e"
    )


def _generate_with_real_api(items: list[EmissionItem], total_co2_kg: float) -> str | None:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return None

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)
        message = client.messages.create(
            model="claude-sonnet-5",
            max_tokens=200,
            messages=[{"role": "user", "content": _build_prompt(items, total_co2_kg)}],
        )
        return message.content[0].text
    except Exception:
        # Si la API real falla (sin crédito, sin red, etc.), no rompemos el
        # flujo del usuario: caemos al análisis simulado.
        return None


def _generate_simulated(items: list[EmissionItem], total_co2_kg: float) -> str:
    if not items or total_co2_kg == 0:
        return "No se detectaron actividades suficientes hoy para generar un análisis."

    top_item = max(items, key=lambda item: item.co2_kg)
    percentage = round((top_item.co2_kg / total_co2_kg) * 100) if total_co2_kg > 0 else 0
    recommendation = _RECOMMENDATIONS_BY_CATEGORY.get(
        top_item.category, "Revisá esta categoría con más detalle para encontrar oportunidades de reducción."
    )

    return (
        f"Tu principal fuente de emisiones hoy fue **{top_item.category}** "
        f"({top_item.co2_kg} kg CO2e, {percentage}% del total de {total_co2_kg} kg CO2e). {recommendation}"
    )


def generate_insight(items: list[EmissionItem], total_co2_kg: float) -> str:
    """Genera el análisis en lenguaje natural. Intenta la API real primero
    (si está configurada); si no está disponible o falla, usa el generador
    simulado con el mismo contrato de salida."""
    real_result = _generate_with_real_api(items, total_co2_kg)
    if real_result is not None:
        return real_result
    return _generate_simulated(items, total_co2_kg)
