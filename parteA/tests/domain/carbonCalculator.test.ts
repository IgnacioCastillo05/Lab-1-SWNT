import { calculateCarbonFootprint } from '../../src/domain/carbonCalculator';
import { UnsupportedVehicleTypeError, ValidationError } from '../../src/domain/errors';
import { VehicleType } from '../../src/domain/types';

describe('calculateCarbonFootprint', () => {
  describe('cálculo válido por tipo de vehículo', () => {
    it('calcula correctamente para DIESEL', () => {
      const result = calculateCarbonFootprint({
        vehicleType: 'DIESEL',
        cargoWeightTons: 10,
        distanceKm: 100,
        efficiencyFactor: 1,
      });

      expect(result.vehicleType).toBe(VehicleType.DIESEL);
      expect(result.emissionFactorKgPerTonKm).toBe(0.062);
      expect(result.co2EmissionsKg).toBe(62);
    });

    it('calcula correctamente para ELECTRIC', () => {
      const result = calculateCarbonFootprint({
        vehicleType: 'ELECTRIC',
        cargoWeightTons: 10,
        distanceKm: 100,
        efficiencyFactor: 1,
      });

      expect(result.co2EmissionsKg).toBe(20);
    });

    it('calcula correctamente para HYBRID', () => {
      const result = calculateCarbonFootprint({
        vehicleType: 'HYBRID',
        cargoWeightTons: 10,
        distanceKm: 100,
        efficiencyFactor: 1,
      });

      expect(result.co2EmissionsKg).toBe(45);
    });

    it('normaliza el tipo de vehículo sin importar mayúsculas/minúsculas o espacios', () => {
      const result = calculateCarbonFootprint({
        vehicleType: '  diesel ',
        cargoWeightTons: 1,
        distanceKm: 1,
        efficiencyFactor: 1,
      });

      expect(result.vehicleType).toBe(VehicleType.DIESEL);
    });

    it('aplica el factor de eficiencia como multiplicador', () => {
      const result = calculateCarbonFootprint({
        vehicleType: 'DIESEL',
        cargoWeightTons: 10,
        distanceKm: 100,
        efficiencyFactor: 0.5,
      });

      expect(result.co2EmissionsKg).toBe(31);
    });

    it('redondea el resultado a dos decimales', () => {
      const result = calculateCarbonFootprint({
        vehicleType: 'DIESEL',
        cargoWeightTons: 3,
        distanceKm: 7,
        efficiencyFactor: 1.1111,
      });

      const decimals = result.co2EmissionsKg.toString().split('.')[1] ?? '';
      expect(decimals.length).toBeLessThanOrEqual(2);
      expect(result.co2EmissionsKg).toBeCloseTo(1.45, 2);
    });
  });

  describe('casos de borde', () => {
    it('retorna 0 kg de CO2 cuando la distancia es cero', () => {
      const result = calculateCarbonFootprint({
        vehicleType: 'DIESEL',
        cargoWeightTons: 10,
        distanceKm: 0,
        efficiencyFactor: 1,
      });

      expect(result.co2EmissionsKg).toBe(0);
    });

    it('rechaza carga negativa', () => {
      expect(() =>
        calculateCarbonFootprint({
          vehicleType: 'DIESEL',
          cargoWeightTons: -5,
          distanceKm: 100,
          efficiencyFactor: 1,
        }),
      ).toThrow(ValidationError);
    });

    it('rechaza carga igual a cero', () => {
      expect(() =>
        calculateCarbonFootprint({
          vehicleType: 'DIESEL',
          cargoWeightTons: 0,
          distanceKm: 100,
          efficiencyFactor: 1,
        }),
      ).toThrow(ValidationError);
    });

    it('rechaza carga por encima del límite permitido', () => {
      expect(() =>
        calculateCarbonFootprint({
          vehicleType: 'DIESEL',
          cargoWeightTons: 10000,
          distanceKm: 100,
          efficiencyFactor: 1,
        }),
      ).toThrow(ValidationError);
    });

    it('rechaza distancia negativa', () => {
      expect(() =>
        calculateCarbonFootprint({
          vehicleType: 'DIESEL',
          cargoWeightTons: 10,
          distanceKm: -1,
          efficiencyFactor: 1,
        }),
      ).toThrow(ValidationError);
    });

    it('rechaza distancia por encima del límite permitido', () => {
      expect(() =>
        calculateCarbonFootprint({
          vehicleType: 'DIESEL',
          cargoWeightTons: 10,
          distanceKm: 999999,
          efficiencyFactor: 1,
        }),
      ).toThrow(ValidationError);
    });

    it('rechaza tipos de vehículo no soportados', () => {
      expect(() =>
        calculateCarbonFootprint({
          vehicleType: 'GASOLINE',
          cargoWeightTons: 10,
          distanceKm: 100,
          efficiencyFactor: 1,
        }),
      ).toThrow(UnsupportedVehicleTypeError);
    });

    it('rechaza tipo de vehículo vacío', () => {
      expect(() =>
        calculateCarbonFootprint({
          vehicleType: '',
          cargoWeightTons: 10,
          distanceKm: 100,
          efficiencyFactor: 1,
        }),
      ).toThrow(ValidationError);
    });

    it('rechaza factor de eficiencia igual a cero', () => {
      expect(() =>
        calculateCarbonFootprint({
          vehicleType: 'DIESEL',
          cargoWeightTons: 10,
          distanceKm: 100,
          efficiencyFactor: 0,
        }),
      ).toThrow(ValidationError);
    });

    it('rechaza factor de eficiencia negativo', () => {
      expect(() =>
        calculateCarbonFootprint({
          vehicleType: 'DIESEL',
          cargoWeightTons: 10,
          distanceKm: 100,
          efficiencyFactor: -2,
        }),
      ).toThrow(ValidationError);
    });

    it('rechaza factor de eficiencia por encima del límite permitido', () => {
      expect(() =>
        calculateCarbonFootprint({
          vehicleType: 'DIESEL',
          cargoWeightTons: 10,
          distanceKm: 100,
          efficiencyFactor: 50,
        }),
      ).toThrow(ValidationError);
    });

    it('rechaza valores no numéricos (NaN)', () => {
      expect(() =>
        calculateCarbonFootprint({
          vehicleType: 'DIESEL',
          cargoWeightTons: Number.NaN,
          distanceKm: 100,
          efficiencyFactor: 1,
        }),
      ).toThrow(ValidationError);
    });

    it('rechaza valores infinitos', () => {
      expect(() =>
        calculateCarbonFootprint({
          vehicleType: 'DIESEL',
          cargoWeightTons: 10,
          distanceKm: Number.POSITIVE_INFINITY,
          efficiencyFactor: 1,
        }),
      ).toThrow(ValidationError);
    });

    it('rechaza tipos de datos incorrectos (string en vez de number)', () => {
      expect(() =>
        calculateCarbonFootprint({
          vehicleType: 'DIESEL',
          // @ts-expect-error prueba intencional con tipo inválido
          cargoWeightTons: '10',
          distanceKm: 100,
          efficiencyFactor: 1,
        }),
      ).toThrow(ValidationError);
    });

    it('rechaza un cuerpo nulo o no-objeto', () => {
      // @ts-expect-error prueba intencional con entrada inválida
      expect(() => calculateCarbonFootprint(null)).toThrow(ValidationError);
    });
  });
});