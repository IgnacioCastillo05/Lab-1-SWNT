export class DomainError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnsupportedVehicleTypeError extends DomainError {
  constructor(vehicleType: string, supportedTypes: readonly string[]) {
    super(
      `Tipo de vehículo no soportado: "${vehicleType}". Tipos válidos: ${supportedTypes.join(', ')}.`,
      400,
    );
  }
}