import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { validateRequest } from '../../middleware/validateRequest';

describe('validateRequest middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  const validationRules = [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ];

  it('should call next() when validation passes', async () => {
    mockRequest.body = {
      email: 'test@example.com',
      password: 'password123',
    };

    // Apply validation rules
    for (const rule of validationRules) {
      await rule.run(mockRequest as Request);
    }

    validateRequest(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it('should return 400 with error message for invalid email', async () => {
    mockRequest.body = {
      email: 'invalid-email',
      password: 'password123',
    };

    // Apply validation rules
    for (const rule of validationRules) {
      await rule.run(mockRequest as Request);
    }

    validateRequest(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      errors: expect.arrayContaining([
        expect.objectContaining({
          msg: 'Invalid email',
        }),
      ]),
    });
  });

  it('should return 400 with error message for short password', async () => {
    mockRequest.body = {
      email: 'test@example.com',
      password: '12345',
    };

    // Apply validation rules
    for (const rule of validationRules) {
      await rule.run(mockRequest as Request);
    }

    validateRequest(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      errors: expect.arrayContaining([
        expect.objectContaining({
          msg: 'Password must be at least 6 characters',
        }),
      ]),
    });
  });

  it('should return 400 with error message for missing required fields', async () => {
    mockRequest.body = {};

    // Apply validation rules
    for (const rule of validationRules) {
      await rule.run(mockRequest as Request);
    }

    validateRequest(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      errors: expect.arrayContaining([
        expect.objectContaining({
          msg: expect.any(String),
        }),
      ]),
    });
  });
}); 