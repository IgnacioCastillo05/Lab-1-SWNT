import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('POST /api/carbon-footprint', () => {
  it('retorna 200 y el cálculo de emisiones para una entrada válida', async () => {
    const response = await request(app).post('/api/carbon-footprint').send({
      vehicleType: 'DIESEL',
      cargoWeightTons: 10,
      distanceKm: 100,
      efficiencyFactor: 1,
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      vehicleType: 'DIESEL',
      co2EmissionsKg: 62,
    });
  });

  it('retorna 400 y un mensaje claro cuando el tipo de vehículo no es soportado', async () => {
    const response = await request(app).post('/api/carbon-footprint').send({
      vehicleType: 'GASOLINE',
      cargoWeightTons: 10,
      distanceKm: 100,
      efficiencyFactor: 1,
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('UnsupportedVehicleTypeError');
  });

  it('retorna 400 cuando faltan campos obligatorios', async () => {
    const response = await request(app).post('/api/carbon-footprint').send({
      vehicleType: 'DIESEL',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('ValidationError');
  });

  it('retorna 400 cuando la carga es negativa', async () => {
    const response = await request(app).post('/api/carbon-footprint').send({
      vehicleType: 'DIESEL',
      cargoWeightTons: -5,
      distanceKm: 100,
      efficiencyFactor: 1,
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('ValidationError');
  });

  it('retorna 200 con emisiones en 0 cuando la distancia es cero', async () => {
    const response = await request(app).post('/api/carbon-footprint').send({
      vehicleType: 'ELECTRIC',
      cargoWeightTons: 5,
      distanceKm: 0,
      efficiencyFactor: 1,
    });

    expect(response.status).toBe(200);
    expect(response.body.co2EmissionsKg).toBe(0);
  });

  it('retorna 400 cuando el body no es JSON sintácticamente válido', async () => {
    const response = await request(app)
      .post('/api/carbon-footprint')
      .set('Content-Type', 'application/json')
      .send('{ vehicleType: "DIESEL", ');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('ValidationError');
  });

  it('retorna 400 cuando el body es un JSON válido pero no un objeto', async () => {
    const response = await request(app)
      .post('/api/carbon-footprint')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify('just a string'));

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('ValidationError');
  });
});