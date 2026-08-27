import { EMISSION_FACTORS_KG_PER_TON_KM } from './emissionFactors';
import { validateEmissionInput } from './validators';
import { EmissionInput, EmissionResult } from './types';

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calcula la huella de carbono (kg de CO2) de un trayecto de carga.
 *
 * Fórmula: emisiones_kg = distancia_km * peso_toneladas * factor_emisión(vehículo) * factor_eficiencia
 *
 * @throws {ValidationError} si algún campo de entrada es inválido.
 * @throws {UnsupportedVehicleTypeError} si el tipo de vehículo no está soportado.
 */
export function calculateCarbonFootprint(rawInput: EmissionInput): EmissionResult {
  const input = validateEmissionInput(rawInput);
  const emissionFactorKgPerTonKm = EMISSION_FACTORS_KG_PER_TON_KM[input.vehicleType];

  const co2EmissionsKg = roundToTwoDecimals(
    input.distanceKm * input.cargoWeightTons * emissionFactorKgPerTonKm * input.efficiencyFactor,
  );

  return {
    ...input,
    emissionFactorKgPerTonKm,
    co2EmissionsKg,
  };
}