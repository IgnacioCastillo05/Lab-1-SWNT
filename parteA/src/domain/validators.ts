import { ValidationError, UnsupportedVehicleTypeError } from './errors';
import { EmissionInput, NormalizedEmissionInput, VehicleType } from './types';

const SUPPORTED_VEHICLE_TYPES = Object.values(VehicleType);

const MAX_EFFICIENCY_FACTOR = 5;
const MAX_CARGO_WEIGHT_TONS = 200;
const MAX_DISTANCE_KM = 20000; 

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function requireFiniteNumber(value: unknown, field: string): number {
  if (!isFiniteNumber(value)) {
    throw new ValidationError(`El campo "${field}" debe ser un número finito.`);
  }
  return value;
}

function requireVehicleType(value: unknown): VehicleType {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError('El campo "vehicleType" es obligatorio y debe ser una cadena de texto.');
  }

  const normalized = value.trim().toUpperCase();
  if (!SUPPORTED_VEHICLE_TYPES.includes(normalized as VehicleType)) {
    throw new UnsupportedVehicleTypeError(value, SUPPORTED_VEHICLE_TYPES);
  }

  return normalized as VehicleType;
}

/**
 * Valida y normaliza la entrada cruda (por ejemplo, el body de un request HTTP)
 * en un objeto de dominio seguro para el cálculo de emisiones.
 * Lanza ValidationError / UnsupportedVehicleTypeError ante cualquier dato inválido.
 */
export function validateEmissionInput(rawInput: EmissionInput): NormalizedEmissionInput {
  if (rawInput === null || typeof rawInput !== 'object') {
    throw new ValidationError('El cuerpo de la solicitud debe ser un objeto JSON válido.');
  }

  const vehicleType = requireVehicleType(rawInput.vehicleType);

  const cargoWeightTons = requireFiniteNumber(rawInput.cargoWeightTons, 'cargoWeightTons');
  if (cargoWeightTons <= 0) {
    throw new ValidationError('El campo "cargoWeightTons" debe ser un número mayor a 0.');
  }
  if (cargoWeightTons > MAX_CARGO_WEIGHT_TONS) {
    throw new ValidationError(`El campo "cargoWeightTons" no puede superar ${MAX_CARGO_WEIGHT_TONS} toneladas.`);
  }

  const distanceKm = requireFiniteNumber(rawInput.distanceKm, 'distanceKm');
  if (distanceKm < 0) {
    throw new ValidationError('El campo "distanceKm" no puede ser negativo.');
  }
  if (distanceKm > MAX_DISTANCE_KM) {
    throw new ValidationError(`El campo "distanceKm" no puede superar ${MAX_DISTANCE_KM} km.`);
  }

  const efficiencyFactor = requireFiniteNumber(rawInput.efficiencyFactor, 'efficiencyFactor');
  if (efficiencyFactor <= 0) {
    throw new ValidationError('El campo "efficiencyFactor" debe ser un número mayor a 0.');
  }
  if (efficiencyFactor > MAX_EFFICIENCY_FACTOR) {
    throw new ValidationError(`El campo "efficiencyFactor" no puede superar ${MAX_EFFICIENCY_FACTOR}.`);
  }

  return { vehicleType, cargoWeightTons, distanceKm, efficiencyFactor };
}