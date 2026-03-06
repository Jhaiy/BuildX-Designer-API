import { Router } from "express";
import {
  handleViewSharedProjects,
  handleFetchPublishedTemplates,
} from "../controllers/projectview.controller";

const router = Router();

router.get("/shared-projects", handleViewSharedProjects);

router.get("/published-templates", handleFetchPublishedTemplates);

export default router;
