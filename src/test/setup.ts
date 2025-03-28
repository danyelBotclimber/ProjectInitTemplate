import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { config } from 'dotenv';
import { closeApp } from '../app';

config();

export const testDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'mommybear_test',
  entities: [User],
  synchronize: true,
  logging: false,
  dropSchema: true
});

// Only initialize database for tests that need it
const needsDatabase = (testPath: string) => {
  return testPath.includes('auth.test.ts') || testPath.includes('auth.middleware.test.ts');
};

beforeAll(async () => {
  if (needsDatabase(process.env.JEST_TEST_PATH || '')) {
    try {
      await testDataSource.initialize();
      await testDataSource.synchronize(true); // Force schema recreation
      console.log('Test database connection initialized');
    } catch (error) {
      console.error('Error during test database initialization:', error);
      throw error;
    }
  }
});

beforeEach(async () => {
  if (needsDatabase(process.env.JEST_TEST_PATH || '') && testDataSource.isInitialized) {
    try {
      // Clear all tables
      const entities = testDataSource.entityMetadatas;
      for (const entity of entities) {
        const repository = testDataSource.getRepository(entity.name);
        await repository.clear();
      }
    } catch (error) {
      console.error('Error clearing test database:', error);
      throw error;
    }
  }
});

afterAll(async () => {
  if (testDataSource.isInitialized) {
    await testDataSource.destroy();
    console.log('Test database connection closed');
  }
  await closeApp();
}); 