import { Router } from 'express';
import { calculateEmissions } from '../controllers/carbonController';

const router = Router();

router.post('/carbon-footprint', calculateEmissions);

export default router;