import express from 'express';
import { getRecommendWords } from '../controllers/aiController.js';

const router = express.Router();

router.get('/recommend', getRecommendWords);

export default router;