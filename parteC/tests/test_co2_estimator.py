import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "app"))

from co2_estimator import estimate_co2  # noqa: E402


def test_example_from_the_assignment_prompt():
    result = estimate_co2("Hoy comí carne y viajé 20km en bus")

    assert result.unrecognized_text is False
    categories = {item.category for item in result.items}
    assert categories == {"transporte", "alimentacion"}
    assert result.total_co2_kg == round(20 * 0.105 + 6.61, 2)


def test_multiple_activities_in_one_sentence():
    result = estimate_co2("Comí pollo y pescado, viajé 10km en auto y 5km en bici")

    assert len(result.items) == 4
    assert result.total_co2_kg == round(1.57 + 1.34 + 10 * 0.192 + 5 * 0.0, 2)


def test_case_insensitive_and_decimal_distance():
    result = estimate_co2("VIAJÉ 12.5KM EN AUTO")

    assert len(result.items) == 1
    assert result.items[0].co2_kg == round(12.5 * 0.192, 2)


def test_distance_with_comma_decimal_separator():
    result = estimate_co2("viajé 7,5km en moto")

    assert result.items[0].co2_kg == round(7.5 * 0.103, 2)


def test_unrecognized_text_returns_zero_without_crashing():
    result = estimate_co2("Hoy fue un día tranquilo sin nada especial.")

    assert result.unrecognized_text is True
    assert result.items == []
    assert result.total_co2_kg == 0.0


def test_empty_input_is_handled_gracefully():
    result = estimate_co2("")

    assert result.unrecognized_text is True
    assert result.total_co2_kg == 0.0


def test_longer_keyword_is_not_double_counted_by_shorter_substring():
    result = estimate_co2("comí carne de res")

    # "carne de res" no debe contarse dos veces por contener "carne" y "res".
    assert len(result.items) == 1
    assert result.items[0].co2_kg == 6.61


def test_zero_emission_transport_modes_are_still_recorded_as_items():
    result = estimate_co2("caminé... digo, viajé 3km en bicicleta")

    assert len(result.items) == 1
    assert result.items[0].co2_kg == 0.0
    assert result.total_co2_kg == 0.0
