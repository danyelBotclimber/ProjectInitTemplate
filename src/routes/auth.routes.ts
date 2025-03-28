import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { AppDataSource } from '../config/database';
import { User } from '../entities/user.entity';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { authenticateToken } from '../middleware/auth.middleware';
import { JwtPayload } from '../types/auth';

config();

const router = Router();
const userRepository = AppDataSource.getRepository(User);

interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthResponse {
  user: UserResponse;
  token: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '86400'; // 24 hours in seconds

const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: parseInt(JWT_EXPIRES_IN) });
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid input or email already registered
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('firstName').optional().isString(),
    body('lastName').optional().isString(),
    validateRequest,
  ],
  async (req: Request<{}, AuthResponse, RegisterRequest>, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Check if user exists
      const existingUser = await userRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await userRepository.save({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        isActive: true,
      });

      // Generate JWT
      const token = signToken({ id: user.id, email: user.email });

      const response: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
        },
        token,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest,
  ],
  async (req: Request<{}, AuthResponse, LoginRequest>, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await userRepository.findOne({
        where: { email },
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT
      const token = signToken({ id: user.id, email: user.email });

      const response: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
        },
        token,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/profile',
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userRepository.findOne({
        where: { id: req.user?.id },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const response: UserResponse = {
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

export { router as authRoutes }; 