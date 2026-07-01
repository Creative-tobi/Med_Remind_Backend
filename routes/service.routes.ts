import { Router } from "express";
import { verifyToken } from "../middleware/authmiddleware.js";

// Importing all your controllers
import {
  Register,
  login,
  GetUserProfile,
} from "../controller/auth.controller.js";

import {
  AddMedication,
  GetUserMedications,
  UpdateMedication,
  DeleteMedication,
} from "../controller/medicationController.js";

import { LogDose, GetDoseHistory } from "../controller/doseController.js";

import {
  GetSettings,
  UpdateSettings,
} from "../controller/settingsController.js";

import { ChatWithAI } from "../controller/chatbotController.js";

// Explicitly type the router
const router: Router = Router();


// Public routes
router.post("/auth/register", Register);
router.post("/auth/login", login);

// Protected routes
// The middleware bouncer: Everything below this line requires a valid JWT
router.use(verifyToken);

// User Profile
router.get("/auth/profile", GetUserProfile);

// Medications (CRUD operations)
router.post("/medications", AddMedication);
router.get("/medications", GetUserMedications);
router.put("/medications/:id", UpdateMedication);
router.delete("/medications/:id", DeleteMedication);

// Doses (Tracking if drugs were taken)
router.post("/doses", LogDose);
router.get("/doses", GetDoseHistory);

// Settings (User preferences)
router.get("/settings", GetSettings);
router.put("/settings", UpdateSettings);

// AI Chatbot
router.post("/chat", ChatWithAI);

export default router;
