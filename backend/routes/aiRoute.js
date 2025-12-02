import express from 'express';
import { getRecommendWords } from '../controllers/aiController.js';
import { protectedRoute } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/recommend', protectedRoute, getRecommendWords);

export default router;