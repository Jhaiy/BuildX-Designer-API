import { Request, Response } from "express";
import {
  viewProjectLikes,
  likeProject,
  unlikeProject,
  fetchTemplateData,
  displayTemplates,
  insertTemplateData,
  unpublishTemplate,
  updateTemplateStatus,
} from "../services/projects.service";

export async function handleViewProjectLikes(req: Request, res: Response) {
  try {
    const projectLikes = await viewProjectLikes();
    return res.status(200).json({ projectLikes });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to view project likes",
      details: error?.message ?? error,
    });
  }
}

export async function handleLikeProject(req: Request, res: Response) {
  try {
    const { userId, projectId } = req.body;
    const like = await likeProject(userId, projectId);
    return res
      .status(201)
      .json({ message: "Project liked successfully", like });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to like project",
      details: error?.message ?? error,
    });
  }
}

export async function handleUnlikeProject(req: Request, res: Response) {
  try {
    const { userId, projectId } = req.body;
    const removedLike = await unlikeProject(userId, projectId);
    return res
      .status(200)
      .json({ message: "Project unliked successfully", removedLike });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to unlike project",
      details: error?.message ?? error,
    });
  }
}

export async function handleFetchTemplateData(req: Request, res: Response) {
  try {
    const { projectId } = req.params;
    const templateData = await fetchTemplateData(projectId);
    return res.status(200).json({ templateData });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to fetch template data",
      details: error?.message ?? error,
    });
  }
}

export async function handleDisplayTemplates(req: Request, res: Response) {
  try {
    const templates = await displayTemplates();
    return res.status(200).json({ templates });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to display templates",
      details: error?.message ?? error,
    });
  }
}

export async function handleInsertTemplateData(req: Request, res: Response) {
  try {
    const { projectId, userId } = req.body;
    const insertedData = await insertTemplateData(projectId, userId);
    updateTemplateStatus(projectId, true);
    return res
      .status(201)
      .json({ message: "Template data inserted successfully", insertedData });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to insert template data",
      details: error?.message ?? error,
    });
  }
}

export async function handleUnpublishTemplate(req: Request, res: Response) {
  try {
    const { projectId } = req.params;
    const result = await unpublishTemplate(projectId);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to unpublish template",
      details: error?.message ?? error,
    });
  }
}

export async function handlePublishTemplateStatus(req: Request, res: Response) {
  try {
    const { projectId } = req.params;
    const { isPublished } = req.body;
    const result = await updateTemplateStatus(projectId, isPublished);

    if (isPublished == false) {
      await unpublishTemplate(projectId);
    }

    return res.status(200).json({
      message: "Template status updated successfully",
      result,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to update template status",
      details: error?.message ?? error,
    });
  }
}
