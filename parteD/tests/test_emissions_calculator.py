from app.emissions_calculator import (
    calculate_electricity_emissions,
    calculate_fuel_emissions,
    calculate_natural_gas_emissions,
    calculate_vehicle_emissions,
    calculate_waste_emissions,
)


def test_vehicle_emissions_uses_correct_factor_by_type():
    item = calculate_vehicle_emissions(5, "camioneta")
    assert item.co2_kg == 60.0
    assert item.category == "transporte"


def test_vehicle_emissions_falls_back_to_camioneta_factor_for_unknown_type():
    item = calculate_vehicle_emissions(2, "triciclo")
    assert item.co2_kg == 24.0


def test_electricity_emissions():
    item = calculate_electricity_emissions(200)
    assert item.co2_kg == 80.0
    assert item.category == "electricidad"


def test_fuel_emissions_differentiates_diesel_vs_gasolina():
    diesel_item = calculate_fuel_emissions(100, "diesel")
    gasolina_item = calculate_fuel_emissions(100, "gasolina")
    assert diesel_item.co2_kg == 268.0
    assert gasolina_item.co2_kg == 231.0
    assert diesel_item.co2_kg != gasolina_item.co2_kg


def test_natural_gas_emissions():
    item = calculate_natural_gas_emissions(50)
    assert item.co2_kg == 100.0


def test_waste_emissions():
    item = calculate_waste_emissions(30)
    assert item.co2_kg == 15.0
