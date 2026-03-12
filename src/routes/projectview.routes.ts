import { Router } from "express";
import {
  handleViewSharedProjects,
  handleFetchPublishedTemplates,
  handleFetchDraftProjects,
} from "../controllers/projectview.controller";

const router = Router();

router.get("/shared-projects", handleViewSharedProjects);

router.get("/published-templates", handleFetchPublishedTemplates);

router.get("/draft-projects/:userId", handleFetchDraftProjects);

export default router;
