import { Response } from "express";
import { AuthRequest } from "../middleware/authmiddleware.js";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export const ChatWithAI = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ message: "Unauthorized request" });

    const { message } = req.body;

    if (!message) {
      return res
        .status(400)
        .json({ message: "Please provide a message for the chatbot." });
    }

    // Call the AI model
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction:
          "You are a helpful, empathetic medical reminder assistant named MedRemind AI. You help users understand their medication schedules and answer basic health questions. Always remind users to consult a real doctor for serious medical advice.",
      },
    });

    return res.status(200).json({
      reply: response.text,
    });
  } catch (error) {
    console.error("Chatbot failed:", error);
    return res
      .status(500)
      .json({ error: "Server error while processing chatbot request." });
  }
};
