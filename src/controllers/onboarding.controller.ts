import { Response, Request } from "express";
import {
  fetchUserOnboardingData,
  insertOnboardingData,
} from "../services/onboarding.service";

export async function handleFetchUserOnboardingData(
  req: Request,
  res: Response,
) {
  try {
    const userId = (req.query.userId as string) || req.body?.userId;

    if (!userId) {
      return res.status(400).json({
        error: "Bad Request",
        details: "userId is required",
      });
    }

    const onboardingData = await fetchUserOnboardingData(userId);
    return res.status(200).json(onboardingData);
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function handleInsertOnboardingData(req: Request, res: Response) {
  try {
    const userId = (req.query.userId as string) || req.body?.userId;
    const data = req.body;

    if (!userId) {
      return res.status(400).json({
        error: "Bad Request",
        details: "userId is required",
      });
    }
    if (!data || typeof data !== "object") {
      return res.status(400).json({
        error: "Bad Request",
        details: "Onboarding data is required and must be an object",
      });
    }

    const result = await insertOnboardingData(userId, data);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
