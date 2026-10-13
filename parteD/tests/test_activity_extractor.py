from app.activity_extractor import extract_activities, has_any_activity


def test_example_from_the_assignment_prompt():
    activities = extract_activities("Hoy usamos 5 camionetas de reparto y gastamos 200kWh de luz")

    assert len(activities.vehicles) == 1
    assert activities.vehicles[0].count == 5
    assert activities.vehicles[0].vehicle_type == "camioneta"
    assert activities.electricity_kwh == 200.0


def test_extracts_fuel_type_correctly_not_just_liters():
    activities = extract_activities("Gastamos 100 litros de gasolina en las entregas")

    assert activities.fuel_liters == 100.0
    assert activities.fuel_type == "gasolina", (
        "El extractor debe leer el tipo de combustible mencionado, no asumir "
        "siempre diesel (bug documentado en docs/bitacora.md)."
    )


def test_extracts_diesel_fuel_type():
    activities = extract_activities("Usamos 50 litros de diesel")
    assert activities.fuel_type == "diesel"


def test_extracts_natural_gas_and_waste():
    activities = extract_activities("Consumimos 30 m3 de gas y generamos 15 kg de residuos")

    assert activities.natural_gas_m3 == 30.0
    assert activities.waste_kg == 15.0


def test_multiple_vehicle_types_in_one_sentence():
    activities = extract_activities("Tenemos 3 camiones y 2 motos en circulación hoy")

    assert len(activities.vehicles) == 2
    types = {v.vehicle_type for v in activities.vehicles}
    assert types == {"camion", "moto"}


def test_no_activities_detected_returns_empty_and_flagged():
    activities = extract_activities("Hoy fue un día tranquilo en la oficina.")

    assert has_any_activity(activities) is False


def test_decimal_with_comma_separator():
    activities = extract_activities("Gastamos 150,5kWh hoy")
    assert activities.electricity_kwh == 150.5
