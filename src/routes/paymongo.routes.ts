import { Router } from "express";
import { handlePaymongoCheckout } from "../controllers/paymongo.controller";

const router = Router();

router.post("/paymongo/checkout", handlePaymongoCheckout);

export default router;
