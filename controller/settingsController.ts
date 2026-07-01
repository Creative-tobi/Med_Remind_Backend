import { Response } from "express";
import { AuthRequest } from "../middleware/authmiddleware.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const GetSettings = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ message: "Unauthorized request" });

    let settings = await prisma.settings.findUnique({
      where: { user_id: userId },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: { user_id: userId },
      });
    }

    return res.status(200).json({ settings });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return res
      .status(500)
      .json({ error: "Server error while fetching settings." });
  }
};

export const UpdateSettings = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ message: "Unauthorized request" });

    const { medication_reminders, sound_alerts, app_language } = req.body;

    const updatedSettings = await prisma.settings.upsert({
      where: { user_id: userId },
      update: { medication_reminders, sound_alerts, app_language },
      create: {
        user_id: userId,
        medication_reminders,
        sound_alerts,
        app_language,
      },
    });

    return res
      .status(200)
      .json({ message: "Settings updated", settings: updatedSettings });
  } catch (error) {
    console.error("Failed to update settings:", error);
    return res
      .status(500)
      .json({ error: "Server error while updating settings." });
  }
};
