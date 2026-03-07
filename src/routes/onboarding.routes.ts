import { Router } from "express";
import {
  handleFetchUserOnboardingData,
  handleInsertOnboardingData,
} from "../controllers/onboarding.controller";

const router = Router();

router.post("/onboarding-data", handleFetchUserOnboardingData);

router.post("/insert-onboarding-data", handleInsertOnboardingData);

export default router;
