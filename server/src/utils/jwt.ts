import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: '30d' });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwtRefreshSecret) as TokenPayload;
};
