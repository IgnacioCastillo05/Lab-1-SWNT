from app.ai_insights import generate_insight
from app.emissions_calculator import EmissionItem


def test_generate_insight_identifies_top_category_and_recommendation():
    items = [
        EmissionItem(description="200 kWh", category="electricidad", co2_kg=80.0),
        EmissionItem(description="5 camionetas", category="transporte", co2_kg=60.0),
    ]
    insight = generate_insight(items, total_co2_kg=140.0)

    assert "electricidad" in insight
    assert "57%" in insight
    assert "renovable" in insight or "solares" in insight


def test_generate_insight_handles_empty_activities():
    insight = generate_insight([], total_co2_kg=0.0)
    assert "no se detectaron" in insight.lower() or "no se detectaron" in insight


def test_generate_insight_uses_simulated_path_without_api_key(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    items = [EmissionItem(description="100L diesel", category="combustible", co2_kg=268.0)]

    insight = generate_insight(items, total_co2_kg=268.0)

    assert "combustible" in insight
