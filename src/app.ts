import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { authRoutes } from './routes/auth.routes';
import { errorHandler } from './middleware/errorHandler';
import { setupSwagger } from './config/swagger';
import { AppDataSource } from './config/database';

const app = express();

// Initialize database connection
export const initializeApp = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('Database connection initialized');
    }

    // Middleware
    app.use(helmet());
    app.use(cors());
    app.use(compression());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // API Documentation
    setupSwagger(app);

    // Routes
    app.use('/api/auth', authRoutes);

    // Error handling
    app.use(errorHandler);

    return app;
  } catch (error) {
    console.error('Error during app initialization:', error);
    throw error;
  }
};

export const closeApp = async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('Database connection closed');
  }
};

export { app }; 