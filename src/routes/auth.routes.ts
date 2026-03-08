import { Router } from "express";
import {
  handleOAuthAuthorizeRedirect,
  handleSupabaseAuth,
  handleAuthCallback,
} from "../controllers/auth.controller";

const router = Router();

router.get("/v2/oauth/authorize", handleOAuthAuthorizeRedirect);
router.get("/auth/supabase", handleSupabaseAuth);
router.get("/auth/callback", handleAuthCallback);

export default router;
