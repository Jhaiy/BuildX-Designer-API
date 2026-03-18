import { Request, Response } from "express";
import { sendConfirmationEmail, recordEmail } from "../services/email.service";

export async function handleSendingEmail(req: Request, res: Response) {
  try {
    const { email, subject, html } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    await sendConfirmationEmail(email, subject, html);
    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send email" });
  }
}

export async function handleRecordingEmail(req: Request, res: Response) {
  try {
    const { subject, from, text } = req.body;
    if (!subject || !from || !text) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await recordEmail(subject, from, text);
    return res.status(200).json({ message: "Email recorded successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to record email" });
  }
}
