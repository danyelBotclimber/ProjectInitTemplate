import { Router } from 'express';
import { AppDataSource } from '../config/database';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // Check database connection
    await AppDataSource.query('SELECT 1');
    
    res.json({
      status: 'success',
      message: 'API is healthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'API is unhealthy',
      timestamp: new Date().toISOString(),
    });
  }
});

export const healthRoutes = router; 