import { Request, Response } from "express";
import {
  checkProjectPermission,
  addProjectCollaborator,
  removeProjectCollaborator,
} from "../services/project.permissions.service";

export async function handleCheckProjectPermission(
  req: Request,
  res: Response,
) {
  const { userId, projectId, requiredRole } = req.body;

  try {
    const hasPermission = await checkProjectPermission(
      userId,
      projectId,
      requiredRole,
    );
    return res.status(200).json({ hasPermission });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to check project permission",
      details: error?.message ?? error,
    });
  }
}

export async function handleAddProjectCollaborator(
  req: Request,
  res: Response,
) {
  const { projectId, userId, role } = req.body;

  try {
    const collaborator = await addProjectCollaborator(projectId, userId, role);
    return res
      .status(201)
      .json({ message: "Collaborator added successfully", collaborator });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to add project collaborator",
      details: error?.message ?? error,
    });
  }
}

export async function handleRemoveProjectCollaborator(
  req: Request,
  res: Response,
) {
  const { projectId, userId } = req.body;

  try {
    const removedCollaborator = await removeProjectCollaborator(
      projectId,
      userId,
    );
    return res.status(200).json({
      message: "Collaborator removed successfully",
      removedCollaborator,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to remove project collaborator",
      details: error?.message ?? error,
    });
  }
}
