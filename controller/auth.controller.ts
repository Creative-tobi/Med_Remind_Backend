import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authmiddleware.js";

const prisma = new PrismaClient();

export const Register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, full_name, age_group, gender } = req.body;

    if (!email || !password || !full_name) {
      return res
        .status(400)
        .json({ error: "Email, password, and name are required." });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "An account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email: email,
        password_hash: hashedPassword,
        full_name: full_name,
        age_group: age_group,
        gender: gender,
      },
    });

    return res.status(201).json({
      message: "Registration successful.",
      user: { id: newUser.id, email: newUser.email },
    });
  } catch (error) {
    console.error("Registration failed", error);
    return res.status(500).json({ error: "Server error during registration" });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
    if (!existingUser) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: existingUser.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        full_name: existingUser.full_name,
      },
    });
  } catch (error) {
    console.error("Login failed", error);
    return res.status(500).json({ error: "Server error during login" });
  }
};

export const GetUserProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized request" });
    }

    const patient = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        full_name: true,
        age_group: true,
        gender: true,
        weekly_adherence_score: true,
        created_at: true,
      },
    });

    if (!patient)
      return res.status(404).json({ message: "User not available" });

    return res
      .status(200)
      .json({ message: "Profile loaded", patient: patient });
  } catch (error) {
    console.error("Fetching profile failed", error);
    return res
      .status(500)
      .json({ error: "Server error during profile retrieval" });
  }
};
