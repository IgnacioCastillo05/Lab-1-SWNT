import { VehicleType } from './types';

// Factores promedio de referencia (kg CO2 por tonelada-kilómetro transportada),
// basados en órdenes de magnitud típicos de reportes de transporte de carga
// (GLEC Framework / EPA). Ajustables según datos reales de la flota de EcoLogistics.
export const EMISSION_FACTORS_KG_PER_TON_KM: Readonly<Record<VehicleType, number>> = {
  [VehicleType.ELECTRIC]: 0.02,
  [VehicleType.HYBRID]: 0.045,
  [VehicleType.DIESEL]: 0.062,
};