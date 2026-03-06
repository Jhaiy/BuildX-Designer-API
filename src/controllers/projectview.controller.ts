import { Request, Response } from "express";
import {
  viewSharedProjects,
  fetchPublishedTemplates,
} from "../services/projectview.service";

export async function handleViewSharedProjects(req: Request, res: Response) {
  try {
    const userId = (req.query.userId as string) || req.body?.userId;

    if (!userId) {
      return res.status(400).json({
        error: "Bad Request",
        details: "userId is required",
      });
    }

    const sharedProjects = await viewSharedProjects(userId);

    if (!sharedProjects || sharedProjects.length === 0) {
      return res.status(404).json({
        error: "Not Found",
        details: "No shared projects found for the specified user",
      });
    }

    return res.status(200).json({ sharedProjects });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function handleFetchPublishedTemplates(
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

    const publishedTemplates = await fetchPublishedTemplates(userId);

    if (!publishedTemplates || publishedTemplates.length === 0) {
      return res.status(404).json({
        error: "Not Found",
        details: "No published templates found for the specified user",
      });
    }

    return res.status(200).json({ publishedTemplates });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
