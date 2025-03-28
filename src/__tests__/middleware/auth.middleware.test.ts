import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../../middleware/auth.middleware';

interface JwtPayload {
  id: string;
  email: string;
}

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;
  let verifySpy: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test_jwt_secret';
    verifySpy = jest.spyOn(jwt, 'verify');
  });

  afterEach(() => {
    verifySpy.mockRestore();
  });

  it('should authenticate valid token and set user', () => {
    const token = 'valid.jwt.token';
    const user: JwtPayload = { id: '123', email: 'test@example.com' };
    mockRequest.headers = { authorization: `Bearer ${token}` };

    verifySpy.mockReturnValueOnce(user);

    authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(verifySpy).toHaveBeenCalledWith(token, 'test_jwt_secret');
    expect(mockRequest.user).toEqual(user);
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should return 401 if no token is provided', () => {
    authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'No token provided' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    const token = 'invalid.token';
    mockRequest.headers = { authorization: `Bearer ${token}` };

    verifySpy.mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });

    authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if token format is malformed', () => {
    mockRequest.headers = { authorization: 'malformed-token' };

    authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid token format' });
    expect(nextFunction).not.toHaveBeenCalled();
  });
}); 