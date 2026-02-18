import { Router } from "express";
import { handleChangePrivacySettings } from "../controllers/privacy.changer.controller";

const router = Router();

router.post("/toggle-privacy", handleChangePrivacySettings);

export default router;
