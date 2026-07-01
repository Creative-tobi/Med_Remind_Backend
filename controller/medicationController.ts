import { Response } from "express";
import { AuthRequest } from "../middleware/authmiddleware.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const AddMedication = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ message: "Unauthorized request" });

    const { name, type, frequency, reminder_times } = req.body;
    if (!name || !type || !frequency || !reminder_times) {
      return res
        .status(400)
        .json({ message: "Please provide all required details." });
    }

    const newMedication = await prisma.medication.create({
      data: {
        user_id: userId,
        name: name,
        type: type,
        frequency: frequency,
        reminder_times: reminder_times,
      },
    });

    return res.status(201).json({
      message: "Medication added successfully",
      medication: newMedication,
    });
  } catch (error) {
    console.error("Failed to add medication:", error);
    return res
      .status(500)
      .json({ error: "Server error while adding medication." });
  }
};

export const GetUserMedications = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ message: "Unauthorized request" });

    const medications = await prisma.medication.findMany({
      where: { user_id: userId, is_active: true },
    });

    return res.status(200).json({ medications });
  } catch (error) {
    console.error("Failed to fetch medications:", error);
    return res
      .status(500)
      .json({ error: "Server error while fetching medications." });
  }
};

export const UpdateMedication = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params as { id: string };
    const { name, type, frequency, reminder_times, is_active } = req.body;

    if (!userId)
      return res.status(401).json({ message: "Unauthorized request" });

    const existingMed = await prisma.medication.findUnique({
      where: { id: id },
    });
    if (!existingMed || existingMed.user_id !== userId) {
      return res
        .status(404)
        .json({ message: "Medication not found or unauthorized" });
    }

    const updatedMed = await prisma.medication.update({
      where: { id: id },
      data: { name, type, frequency, reminder_times, is_active },
    });

    return res
      .status(200)
      .json({ message: "Medication updated", medication: updatedMed });
  } catch (error) {
    console.error("Failed to update medication:", error);
    return res
      .status(500)
      .json({ error: "Server error while updating medication." });
  }
};

export const DeleteMedication = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const medicationId = Array.isArray(id) ? id[0] : id;

    if (!userId)
      return res.status(401).json({ message: "Unauthorized request" });

    if (!medicationId) {
      return res.status(400).json({ message: "Medication ID is required" });
    }

    const existingMed = await prisma.medication.findUnique({
      where: { id: medicationId },
    });
    if (!existingMed || existingMed.user_id !== userId) {
      return res
        .status(404)
        .json({ message: "Medication not found or unauthorized" });
    }

    await prisma.medication.delete({ where: { id: medicationId } });

    return res.status(200).json({ message: "Medication deleted successfully" });
  } catch (error) {
    console.error("Failed to delete medication:", error);
    return res
      .status(500)
      .json({ error: "Server error while deleting medication." });
  }
};
