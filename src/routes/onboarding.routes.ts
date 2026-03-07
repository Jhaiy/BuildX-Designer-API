import { Router } from "express";
import {
  handleFetchUserOnboardingData,
  handleInsertOnboardingData,
} from "../controllers/onboarding.controller";

const router = Router();

router.get("/onboarding-data", handleFetchUserOnboardingData);

router.post("/onboarding-data", handleInsertOnboardingData);

export default router;
