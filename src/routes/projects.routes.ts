import { Router } from "express";
import {
  handleViewProjectLikes,
  handleLikeProject,
  handleUnlikeProject,
  handleFetchTemplateData,
  handleDisplayTemplates,
  handleInsertTemplateData,
  handleUnpublishTemplate,
  handlePublishTemplateStatus,
  handleFetchingCommentsSection,
  handleInsertUserComment,
  handleFetchMostLikedTemplates,
} from "../controllers/projects.controller";

const router = Router();

router.get("/project-likes", handleViewProjectLikes);

router.post("/like-project", handleLikeProject);

router.post("/unlike-project", handleUnlikeProject);

router.get("/template-data/:projectId", handleFetchTemplateData);

router.get("/display-templates", handleDisplayTemplates);

router.post("/insert-template-data", handleInsertTemplateData);

router.get("/fetch-comments/:projectId", handleFetchingCommentsSection);

router.post("/insert-comment", handleInsertUserComment);

router.get("/api/most-liked-templates", handleFetchMostLikedTemplates);

router.delete(
  "/unpublish-template/:projectId",
  handleUnpublishTemplate,
  (req, res) => {
    try {
      return res
        .status(200)
        .json({ message: "Template unpublished successfully" });
    } catch (error: any) {
      return res.status(500).json({
        error: "Failed to unpublish template",
        details: error?.message ?? error,
      });
    }
  },
);

router.put("/publish-template/:projectId", handlePublishTemplateStatus);

export default router;
