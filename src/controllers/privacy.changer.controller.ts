import { Request, Response } from "express";
import {
  changeProjectPrivacySettings,
  changeAnyoneCanPermission,
} from "../services/privacy.changer.service";

export async function handleChangePrivacySettings(req: Request, res: Response) {
  try {
    let projectId: string | undefined;
    let isPublic: boolean | undefined;

    async function dynamicType(dynamicProjectId: any, dynamicIsPublic: any) {
      if (typeof dynamicProjectId === "string") {
        projectId = dynamicProjectId;
      }

      if (typeof dynamicIsPublic === "boolean") {
        isPublic = dynamicIsPublic;
      }
    }

    async function entryTypeCheckArray() {
      if (!projectId && isPublic === undefined) {
        const entries = Object.entries(req.body);
        if (entries.length === 1) {
          await entryTypeCheck(entries);
        }
      }
    }

    async function entryTypeCheck(entry: any) {
      if (entry.length === 1) {
        const [dynamicProjectId, dynamicIsPublic] = entry[0];
        await dynamicType(dynamicProjectId, dynamicIsPublic);
      }
    }

    if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
      if (typeof req.body.projectId === "string") {
        projectId = req.body.projectId;
      }

      if (typeof req.body.isPublic === "boolean") {
        isPublic = req.body.isPublic;
      }

      await entryTypeCheckArray();
    }

    if (!projectId || typeof isPublic !== "boolean") {
      return res.status(400).json({
        message:
          'Invalid request body. Use { projectId: string, isPublic: boolean } or { "<projectId>": boolean }',
      });
    }

    await changeProjectPrivacySettings(projectId, isPublic);
    return res
      .status(200)
      .json({ message: "Project privacy settings updated successfully" });
  } catch (error) {
    console.error("Privacy settings error:", error);
    return res.status(500).json({
      message: "Failed to update project privacy settings",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function updateAnyoneCanPermission(req: Request, res: Response) {
  try {
    const { projectId, anyoneCan } = req.body;

    if (!projectId || !anyoneCan) {
      return res.status(400).json({
        error: "projectId and anyoneCan are required",
      });
    }

    if (anyoneCan !== "edit" && anyoneCan !== "view") {
      return res.status(400).json({
        error: "anyoneCan must be either 'edit' or 'view'",
      });
    }

    await changeAnyoneCanPermission(projectId, anyoneCan);

    return res.status(200).json({
      message: "Anyone-can permission updated successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || "Failed to update anyone-can permission",
    });
  }
}
