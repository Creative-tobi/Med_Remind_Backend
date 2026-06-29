import type { Request, Response } from "express";
import { AuthRequest } from "../middleware/authmiddleware.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
// import  PrismaClient  from "../prisma/generated/client/index.js";
// import { userInfo } from "node:os";

const prisma = new PrismaClient();

//USER ACCOUNT REGISTRATION SETUP
export const Register = async (req: Request, res: Response): Promise<any> => {
  try {
    // task 1 destructuting model
    const { email, password_hash, full_name, age_group, gender } = req.body;

    // task 2 checking if user already exist
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "An account with this email already exist",
      });
    }

    // task 3 hashing password for new user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password_hash, salt);

    // saving new users to the database
    const newUser = await prisma.user.create({
      data: {
        email: email,
        password_hash: hashedPassword,
        full_name: full_name,
        age_group: age_group,
        gender: gender,
      },
    });

    // const newUser = await prisma.user.create({data: userData});

    return res.status(201).json({
      message: "Registration successful.",
      user: { id: newUser.id, email: newUser.email },
    });
  } catch (error) {
    console.error("Resgistration failed", error);
    return res.status(500).json({ error: "Server error during registration" });
  }
};

//EXISTING USER LOGIN SETUP
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    // task 1 destructuring emaial and password
    const { email, password_hash } = req.body;
    if (!email || !password_hash) {
      return res.status(400).json({
        message: "Email, passoword are required",
      });
    }

    // task 2 finding the user in the database using email
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!existingUser) {
      return res.status(400).json({
        message: "Email not available, please create new account",
      });
    }

    // checking if the password matches
    const isMatch = await bcrypt.compare(
      password_hash,
      existingUser.password_hash,
    );
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    //generating token
    const token = jwt.sign(
      {
        id: existingUser.id,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      message: "Login successful",
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

//GETTING USER PROFILE DATA
export const GetUserProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    // const email = Array.isArray(req.params.email) ? req.params.email[0] : req.params.email;
    // const email = req.params.email as string;
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
    if (!patient) {
      return res.status(404).json({ message: "User not available" });
    }

    return res
      .status(200)
      .json({ message: "Welcome to your profile", patient: patient });
  } catch (error) {
    console.error("Fetching profile failed", error);
    return res
      .status(500)
      .json({ error: "Server error during profile retrieval" });
  }
};
