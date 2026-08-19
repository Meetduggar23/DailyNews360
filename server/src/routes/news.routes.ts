import { Router } from "express";
import {
  articleController,
  categoryNewsController,
  clustersController,
  mostReadController,
  searchNewsController,
  sourcesController,
  topNewsController,
  trendingController,
} from "../controllers/news.controller.js";
import { newsLimiter } from "../middleware/middleware.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

router.use(newsLimiter);
router.use(optionalAuth);

router.get("/top", topNewsController);
router.get("/category/:category", categoryNewsController);
router.get("/search", searchNewsController);
router.get("/trending", trendingController);
router.get("/most-read", mostReadController);
router.get("/clusters", clustersController);
router.get("/sources", sourcesController);
router.get("/:id", articleController);

export default router;