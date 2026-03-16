import { Request, Response } from "express";
import {
  checkProjectPermission,
  addProjectCollaborator,
  removeProjectCollaborator,
  updateProjectPermission,
  viewPermissions,
} from "../services/project.permissions.service";

export async function handleViewProjectPermissions(
  req: Request,
  res: Response,
) {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({
      error: "Missing required fields",
      details: "projectId is required",
    });
  }

  try {
    const permissions = await viewPermissions(projectId);
    return res.status(200).json({ permissions });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to view project permissions",
      details: error?.message ?? error,
    });
  }
}

export async function handleCheckProjectPermission(
  req: Request,
  res: Response,
) {
  const { userId, projectId } = req.body;
  const requiredRole = req.body.requiredRole ?? req.body.role;

  if (!userId || !projectId || !requiredRole) {
    return res.status(400).json({
      error: "Missing required fields",
      details: "userId, projectId and requiredRole (or role) are required",
    });
  }

  if (!["owner", "editor", "viewer"].includes(requiredRole)) {
    return res.status(400).json({
      error: "Invalid role",
      details: "requiredRole must be one of owner, editor, viewer",
    });
  }

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

export async function handleUpdateProjectPermission(
  req: Request,
  res: Response,
) {
  const { projectId, userId, newRole } = req.body;

  if (!projectId || !userId || !newRole) {
    return res.status(400).json({
      error: "Missing required fields",
      details: "projectId, userId and newRole are required",
    });
  }

  if (!["editor", "viewer"].includes(newRole)) {
    return res.status(400).json({
      error: "Invalid role",
      details: "newRole must be either editor or viewer",
    });
  }

  try {
    const updatedPermission = await updateProjectPermission(
      projectId,
      userId,
      newRole,
    );
    return res.status(200).json({
      message: "Project permission updated successfully",
      updatedPermission,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to update project permission",
      details: error?.message ?? error,
    });
  }
}

export async function handleAddProjectCollaborator(
  req: Request,
  res: Response,
) {
  const { projectId, email, role } = req.body;

  if (!projectId || !email) {
    return res.status(400).json({
      error: "Missing required fields",
      details: "projectId and email are required",
    });
  }

  try {
    const collaborator = await addProjectCollaborator(
      projectId,
      email,
      role ?? "viewer",
    );
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
