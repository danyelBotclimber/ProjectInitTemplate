import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../entities/user.entity';

config();

const isDevelopment = process.env.NODE_ENV === 'development';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: isDevelopment,
  logging: isDevelopment,
  entities: [User],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
  connectTimeoutMS: 10000,
  maxQueryExecutionTime: 10000,
});

const waitForDatabase = async (retries = 5, delay = 2000): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      await AppDataSource.initialize();
      console.log('Database connection established');
      return;
    } catch (error) {
      console.error(`Database connection attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export const setupDatabase = async () => {
  try {
    // Wait for database to be ready
    await waitForDatabase();

    // In development, ensure the database is synchronized
    if (isDevelopment) {
      await AppDataSource.synchronize();
      console.log('Database schema synchronized');
    }
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  }
}; 