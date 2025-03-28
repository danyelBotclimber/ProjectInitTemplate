import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { setupDatabase } from './config/database';
import { setupPassport } from './config/passport';
import { setupSwagger } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth.routes';
import { healthRoutes } from './routes/health.routes';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Setup Swagger documentation
setupSwagger(app);

// Setup Passport
setupPassport(app);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);

// Error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Setup database connection
    await setupDatabase();
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`API Documentation available at http://localhost:${port}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 