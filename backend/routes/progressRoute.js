import express from "express";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { updateProgress, getUserProgress } from "../controllers/progressController.js";

const router = express.Router();

router.post("/update", protectedRoute, updateProgress);
router.get("/", protectedRoute, getUserProgress);

export default router;