import { Router } from "express";
import {
  handleChangePrivacySettings,
  updateAnyoneCanPermission,
} from "../controllers/privacy.changer.controller";

const router = Router();

router.post("/toggle-privacy", handleChangePrivacySettings);

router.put("/update-anyone-can", updateAnyoneCanPermission);

export default router;
