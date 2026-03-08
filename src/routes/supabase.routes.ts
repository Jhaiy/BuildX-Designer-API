import { Router } from "express";
import {
  handleGetProjects,
  handleGetOrganizations,
  handleGetApiKeys,
  handleGetSchema,
} from "../controllers/supabase.controller";

const router = Router();

router.get("/supabase/projects", handleGetProjects);
router.get("/supabase/organizations", handleGetOrganizations);
router.get("/supabase/projects/:ref/api-keys", handleGetApiKeys);

// Included handling without /api prefix as seen in server.js
router.get("/projects/:ref/api-keys", handleGetApiKeys);

router.get("/supabase/schema", handleGetSchema);

export default router;
