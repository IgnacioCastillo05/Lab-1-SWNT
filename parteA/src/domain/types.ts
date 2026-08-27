export enum VehicleType {
  ELECTRIC = 'ELECTRIC',
  DIESEL = 'DIESEL',
  HYBRID = 'HYBRID',
}

export interface EmissionInput {
  vehicleType: string;
  cargoWeightTons: number;
  distanceKm: number;
  efficiencyFactor: number;
}

export interface NormalizedEmissionInput {
  vehicleType: VehicleType;
  cargoWeightTons: number;
  distanceKm: number;
  efficiencyFactor: number;
}

export interface EmissionResult extends NormalizedEmissionInput {
  emissionFactorKgPerTonKm: number;
  co2EmissionsKg: number;
}