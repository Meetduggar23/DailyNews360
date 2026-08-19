import { Router } from "express";
import {
  clearHistoryController,
  forYouController,
  getHistoryController,
  recordHistoryController,
  recordHistorySchema,
} from "../controllers/history.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/feed", requireAuth, forYouController);
router.get("/", requireAuth, getHistoryController);
router.post("/", validate(recordHistorySchema), recordHistoryController);
router.delete("/", requireAuth, clearHistoryController);

export default router;