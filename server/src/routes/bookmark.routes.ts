import { Router } from "express";
import {
  addBookmarkController,
  addBookmarkSchema,
  listBookmarksController,
  removeBookmarkController,
} from "../controllers/bookmark.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(requireAuth);

router.get("/", listBookmarksController);
router.post("/", validate(addBookmarkSchema), addBookmarkController);
router.delete("/:articleId", removeBookmarkController);

export default router;