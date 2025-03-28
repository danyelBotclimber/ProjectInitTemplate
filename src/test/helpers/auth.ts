import { User } from '../../entities/user.entity';
import { testDataSource } from '../setup';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const createTestUser = async (userData: Partial<User> = {}) => {
  const userRepository = testDataSource.getRepository(User);
  
  const defaultUser = {
    email: 'test@example.com',
    password: await bcrypt.hash('password123', 10),
    firstName: 'Test',
    lastName: 'User',
    isEmailVerified: false,
    isGoogleUser: false,
    ...userData
  };

  const user = userRepository.create(defaultUser);
  return await userRepository.save(user);
};

export const generateTestToken = (user: User) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

export const createAuthenticatedRequest = (user: User) => {
  const token = generateTestToken(user);
  return {
    headers: {
      Authorization: `Bearer ${token}`
    },
    user: {
      id: user.id,
      email: user.email
    }
  };
}; 