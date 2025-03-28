import request from 'supertest';
import { Express } from 'express-serve-static-core';
import { app, initializeApp } from '../app';
import { User } from '../entities/user.entity';
import { testDataSource } from '../test/setup';
import { createTestUser, generateTestToken } from '../test/helpers/auth';

describe('Authentication Endpoints', () => {
  let initializedApp: Express;

  beforeAll(async () => {
    await testDataSource.initialize();
    await testDataSource.synchronize(true);
    initializedApp = await initializeApp();
  });

  beforeEach(async () => {
    await testDataSource.getRepository(User).clear();
  });

  afterAll(async () => {
    await testDataSource.destroy();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(initializedApp)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should return 400 for existing email', async () => {
      await createTestUser();

      const response = await request(initializedApp)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      await createTestUser();

      const response = await request(initializedApp)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should return 401 for invalid credentials', async () => {
      await createTestUser();

      const response = await request(initializedApp)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const user = await createTestUser();
      const token = generateTestToken(user);

      const response = await request(initializedApp)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', user.email);
      expect(response.body).toHaveProperty('firstName', user.firstName);
      expect(response.body).toHaveProperty('lastName', user.lastName);
    });

    it('should return 401 without token', async () => {
      const response = await request(initializedApp)
        .get('/api/auth/profile')
        .send();

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'No token provided');
    });
  });
}); 