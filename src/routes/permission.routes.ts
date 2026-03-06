import { Router } from "express";
import {
  handleCheckProjectPermission,
  handleAddProjectCollaborator,
  handleRemoveProjectCollaborator,
} from "../controllers/permission.controller";

const router = Router();

router.post("/check-permission", handleCheckProjectPermission);

router.post("/add-collaborator", handleAddProjectCollaborator);

router.post("/remove-collaborator", handleRemoveProjectCollaborator);

export default router;
