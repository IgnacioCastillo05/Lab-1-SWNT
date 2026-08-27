import { Request, Response } from 'express';
import { errorHandler } from '../../src/middleware/errorHandler';
import { ValidationError } from '../../src/domain/errors';

function createMockResponse(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('errorHandler', () => {
  const req = {} as Request;
  const next = jest.fn();

  it('responde con el statusCode y nombre del DomainError', () => {
    const res = createMockResponse();
    const error = new ValidationError('campo inválido');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'ValidationError', message: 'campo inválido' });
  });

  it('responde 500 ante un error inesperado no controlado', () => {
    const res = createMockResponse();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    errorHandler(new Error('boom'), req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'InternalServerError',
      message: 'Ocurrió un error inesperado.',
    });

    consoleErrorSpy.mockRestore();
  });
});