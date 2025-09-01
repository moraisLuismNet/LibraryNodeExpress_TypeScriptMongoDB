import { Request, Response } from "express";
import { UserModel, UserDocument } from "../models/userModel";
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";

// Types
type JwtPayload = {
  id: string;
  role: string;
};

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_here";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

class AuthController {
  constructor() {}

  // User login
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    try {
      // Find user by email
      const user = await UserModel.findOne({ email }).select("+password");

      // Check if user exists and password is correct
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const payload: JwtPayload = {
        id: user._id.toString(),
        role: user.role,
      };

      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      } as SignOptions);

      // Set cookie with token
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      // Return user data without password
      return res.json({
        token,
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res
        .status(500)
        .json({ message: "An error occurred during login" });
    }
  }
}

export default new AuthController();
