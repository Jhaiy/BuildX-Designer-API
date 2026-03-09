import { Router } from "express";
import {
  handleFetchUserOnboardingData,
  handleInsertOnboardingData,
} from "../controllers/onboarding.controller";

const router = Router();

router.get("/onboarding-data/:userId", handleFetchUserOnboardingData);

router.post("/insert-onboarding-data", handleInsertOnboardingData);

export default router;
