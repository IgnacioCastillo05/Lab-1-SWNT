import { NextFunction, Request, Response } from 'express';
import { DomainError } from '../domain/errors';

interface BodyParserSyntaxError extends SyntaxError {
  status: number;
  body: unknown;
}

function isBodyParserSyntaxError(err: unknown): err is BodyParserSyntaxError {
  if (!(err instanceof SyntaxError)) {
    return false;
  }
  const maybe = err as Partial<BodyParserSyntaxError>;
  return maybe.status === 400 && 'body' in err;
}


export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof DomainError) {
    res.status(err.statusCode).json({ error: err.name, message: err.message });
    return;
  }

  if (isBodyParserSyntaxError(err)) {
    res.status(400).json({ error: 'ValidationError', message: 'El cuerpo de la solicitud no es JSON válido.' });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'InternalServerError', message: 'Ocurrió un error inesperado.' });
}