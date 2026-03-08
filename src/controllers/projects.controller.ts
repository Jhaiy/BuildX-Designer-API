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
  fetchUserComments,
  insertUserComment,
  getUserTemplateLikes,
  countProjectLikesForProjects,
} from "../services/projects.service";

type ControllerError = Error & {
  status?: number;
  code?: string;
};

function getErrorStatus(error: ControllerError): number {
  if (typeof error?.status === "number") {
    return error.status;
  }

  if (error?.code === "23505") {
    return 409;
  }

  return 500;
}

export async function handleViewProjectLikes(req: Request, res: Response) {
  try {
    const { userId } = req.query as { userId?: string };
    const projectLikes = await viewProjectLikes();
    const likeCountsByProject = (projectLikes ?? []).reduce(
      (acc: Record<string, number>, like: any) => {
        acc[like.project_id] = (acc[like.project_id] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const projectLikesWithCount = (projectLikes ?? []).map((like: any) => ({
      ...like,
      likeCount: likeCountsByProject[like.project_id] ?? 0,
    }));

    let likedProjectIds: string[] = [];
    if (userId) {
      likedProjectIds = await getUserTemplateLikes(userId);
    }

    return res.status(200).json({
      projectLikes: projectLikesWithCount,
      totalLikeCount: projectLikesWithCount.length,
      likeCountsByProject,
      likedProjectIds, // Added for compatibility with server.js
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to view project likes",
      details: error?.message ?? error,
    });
  }
}

export async function handleTemplateLikes(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "userId is required." });
    }
    const likedProjectIds = await getUserTemplateLikes(userId);
    return res.status(200).json({ likedProjectIds });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to fetch template likes.",
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
    return res.status(getErrorStatus(error)).json({
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
    return res.status(getErrorStatus(error)).json({
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
    const projectIds = (templates ?? []).map(
      (template: any) => template.project_id,
    );
    const likeCounts = await countProjectLikesForProjects(projectIds);
    const templatesWithLikeCount = (templates ?? []).map((template: any) => ({
      ...template,
      likeCount: likeCounts[template.project_id] ?? 0,
    }));

    return res.status(200).json({ templates: templatesWithLikeCount });
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
    await updateTemplateStatus(projectId, true);
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

export async function handleInsertUserComment(req: Request, res: Response) {
  try {
    const { projectId, userId, userComment } = req.body;
    const insertedComment = await insertUserComment(
      projectId,
      userId,
      userComment,
    );
    return res
      .status(201)
      .json({ message: "Comment added successfully", insertedComment });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to insert user comment",
      details: error?.message ?? error,
    });
  }
}

export async function handleFetchingCommentsSection(
  req: Request,
  res: Response,
) {
  try {
    const { projectId } = req.params;
    const comments = await fetchUserComments(projectId);
    return res.status(200).json({ comments });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to fetch comments",
      details: error?.message ?? error,
    });
  }
}
