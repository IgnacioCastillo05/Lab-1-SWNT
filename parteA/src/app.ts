import express, { Express } from 'express';
import carbonRoutes from './routes/carbonRoutes';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): Express {
  const app = express();

  app.use(express.json());
  app.use('/api', carbonRoutes);
  app.use(errorHandler);

  return app;
}