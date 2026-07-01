import { Response } from "express";
import { AuthRequest } from "../middleware/authmiddleware.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const LogDose = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ message: "Unauthorized request" });

    const { medication_id, scheduled_datetime, status } = req.body;

    if (!medication_id || !scheduled_datetime || !status) {
      return res
        .status(400)
        .json({
          message: "Please provide medication ID, scheduled time, and status.",
        });
    }

    const medication = await prisma.medication.findUnique({
      where: { id: medication_id },
    });
    if (!medication || medication.user_id !== userId) {
      return res.status(404).json({ message: "Medication not found." });
    }

    const newLog = await prisma.doseLog.create({
      data: {
        user_id: userId,
        medication_id: medication_id,
        scheduled_datetime: new Date(scheduled_datetime),
        status: status,
        taken_at: status === "TAKEN" ? new Date() : null,
      },
    });

    return res
      .status(201)
      .json({ message: "Dose logged successfully", log: newLog });
  } catch (error) {
    console.error("Failed to log dose:", error);
    return res.status(500).json({ error: "Server error while logging dose." });
  }
};

export const GetDoseHistory = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ message: "Unauthorized request" });

    const history = await prisma.doseLog.findMany({
      where: { user_id: userId },
      orderBy: { scheduled_datetime: "desc" },
      include: {
        medication: {
          select: { name: true, type: true },
        },
      },
    });

    return res.status(200).json({ history });
  } catch (error) {
    console.error("Failed to fetch history:", error);
    return res
      .status(500)
      .json({ error: "Server error while fetching history." });
  }
};
