import express from "express";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { updateProgress, getUserProgress } from "../controllers/progressController.js";

const router = express.Router();

router.post("/update", updateProgress);
router.get("/", getUserProgress);

export default router;