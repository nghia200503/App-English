import express from 'express';
import { createStudySession, getUserHistory } from '../controllers/studySessionController.js';

const router = express.Router();

router.post('/', createStudySession);
router.get('/', getUserHistory);

export default router;