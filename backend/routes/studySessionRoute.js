import express from 'express';
import { createStudySession, getUserHistory } from '../controllers/studySessionController.js';
import { protectedRoute } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protectedRoute, createStudySession);
router.get('/', protectedRoute, getUserHistory);

export default router;