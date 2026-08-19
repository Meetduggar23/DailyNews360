import { Router } from "express";
import {
  loginController,
  loginSchema,
  logoutController,
  meController,
  registerController,
  registerSchema,
  updateProfileController,
  updateProfileSchema,
} from "../controllers/auth.controller.js";
import { authLimiter } from "../middleware/middleware.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), registerController);
router.post("/login", authLimiter, validate(loginSchema), loginController);
router.post("/logout", logoutController);
router.get("/me", requireAuth, meController);
router.put("/profile", requireAuth, validate(updateProfileSchema), updateProfileController);

export default router;