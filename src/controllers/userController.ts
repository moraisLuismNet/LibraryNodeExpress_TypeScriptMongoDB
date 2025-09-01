import { Request, Response } from "express";
import { UserModel } from "../models/userModel";
import bcrypt from "bcrypt";

class UserController {
  constructor() {}

  // List all users
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UserModel.find();
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ message: "Error getting users" });
    }
  }

  // Get a user by id
  async getUser(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ message: "Error getting user" });
    }
  }

  // Create a new user
  async post(req: Request, res: Response) {
    const { userName, email, password, role } = req.body;

    if (!userName || !email || !password) {
      return res.status(400).json({ message: "Username, email and password are required" });
    }

    try {
      // Check if user already exists
      const existingUser = await UserModel.findOne({ 
        $or: [
          { email },
          { userName }
        ]
      });
      
      if (existingUser) {
        if (existingUser.email === email) {
          return res.status(400).json({ message: "User already exists with this email" });
        }
        if (existingUser.userName === userName) {
          return res.status(400).json({ message: "Username is already taken" });
        }
      }

      // Create new user - password will be hashed by the pre-save hook
      const newUser = new UserModel({
        userName,
        email,
        password,
        role: role || 'user'
      });

      await newUser.save();
      return res.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ message: "Error creating user" });
    }
  }

  // Update an existing user by id
  async put(req: Request, res: Response) {
    const { id } = req.params;
    const { userName, email, password, role } = req.body;

    try {
      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if new email or username is already taken
      if (email || userName) {
        const orConditions: any[] = [];
        if (email) {
          orConditions.push({ email });
        }
        if (userName) {
          orConditions.push({ userName });
        }

        if (orConditions.length > 0) {
          const existingUser = await UserModel.findOne({
            _id: { $ne: id },
            $or: orConditions,
          });

          if (existingUser) {
            if (existingUser.email === email) {
              return res.status(400).json({ message: "Email is already in use" });
            }
            if (existingUser.userName === userName) {
              return res.status(400).json({ message: "Username is already taken" });
            }
          }
        }
      }

      // Update user properties
      if (email) {
        user.email = email;
      }
      if (userName) {
        user.userName = userName;
      }

      // Update role if provided and current user is admin
      if (role && req.user?.role === 'admin') {
        user.role = role;
      }
      
      // Update password if provided
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }

      const updatedUser = await user.save();
      return res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ message: "Error updating user" });
    }
  }

  // Delete an existing user by ID
  async delete(req: Request, res: Response) {
    const { id } = req.params;
    try {
      // Prevent deleting your own account
      if (req.user?._id.toString() === id) {
        return res.status(400).json({ message: "You cannot delete your own account" });
      }

      const user = await UserModel.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json({ message: "User successfully deleted" });
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ message: "Error deleting user" });
    }
  }
}

export default new UserController();