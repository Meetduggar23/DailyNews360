import { Router } from "express";
import authRoutes from "./auth.routes.js";
import newsRoutes from "./news.routes.js";
import bookmarkRoutes from "./bookmark.routes.js";
import preferenceRoutes from "./preference.routes.js";
import historyRoutes from "./history.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/news", newsRoutes);
router.use("/bookmarks", bookmarkRoutes);
router.use("/preferences", preferenceRoutes);
router.use("/history", historyRoutes);

export default router;