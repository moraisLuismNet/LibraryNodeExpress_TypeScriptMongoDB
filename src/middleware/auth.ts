import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserModel, UserDocument } from "../models/userModel";

// Types
type JwtPayloadWithUser = JwtPayload & {
  id: string;
  role: string;
};

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_here";

export interface AuthenticatedRequest extends Request {
  user?: UserDocument;
}

// Middleware to protect routes
export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from header or cookie
    let token: string | undefined;
    
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayloadWithUser;

    // Check if user still exists
    const currentUser = await UserModel.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat as number)) {
      return res.status(401).json({
        status: 'fail',
        message: 'User recently changed password! Please log in again.'
      });
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (err) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid token or session expired. Please log in again.'
    });
  }
};

// Restrict to certain roles
export const restrictTo = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};
