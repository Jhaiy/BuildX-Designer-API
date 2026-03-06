import { Router } from "express";
import {
  handleCheckProjectPermission,
  handleAddProjectCollaborator,
  handleRemoveProjectCollaborator,
  handleUpdateProjectPermission,
  handleViewProjectPermissions,
} from "../controllers/permission.controller";

const router = Router();

router.get("/view-permissions", handleViewProjectPermissions);

router.get("/check-permission", handleCheckProjectPermission);

router.put("/update-permission", handleUpdateProjectPermission);

router.post("/add-collaborator", handleAddProjectCollaborator);

router.delete("/remove-collaborator", handleRemoveProjectCollaborator);

export default router;
