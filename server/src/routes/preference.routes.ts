import { Router } from "express";
import {
  getPreferencesController,
  updatePreferencesController,
  updatePreferencesSchema,
} from "../controllers/preference.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(requireAuth);

router.get("/", getPreferencesController);
router.put("/", validate(updatePreferencesSchema), updatePreferencesController);

export default router;