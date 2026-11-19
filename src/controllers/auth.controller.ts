
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDB } from "../config/db.js";
import { User } from "../models/user.model.js";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, photo, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (
      password.length < 6 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain an uppercase letter, a lowercase letter and at least 6 characters.",
      });
    }

    const db = getDB();

    const existingUser = await db.collection<User>("users").findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user: User = {
      name: name.trim(),
      email: normalizedEmail,
      photo: typeof photo === "string" ? photo.trim() : "",
      password: hashedPassword,
      role: "customer",
      createdAt: new Date(),
    };

    const result = await db.collection<User>("users").insertOne(user);

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is missing from environment variables.");
    }

    const token = jwt.sign(
      {
        userId: result.insertedId.toString(),
        role: user.role,
      },
      secret,
      { expiresIn: "1d" }
    );

    res.cookie("rentwise_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully!",
      user: {
        id: result.insertedId.toString(),
        name: user.name,
        email: user.email,
        photo: user.photo,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create account.",
    });
  }
};
