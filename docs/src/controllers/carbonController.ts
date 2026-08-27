import { NextFunction, Request, Response } from 'express';
import { calculateCarbonFootprint } from '../domain/carbonCalculator';

export function calculateEmissions(req: Request, res: Response, next: NextFunction): void {
  try {
    const result = calculateCarbonFootprint(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}