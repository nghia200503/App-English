import express from "express";
import { wordList, wordAdd, wordGetById, wordUpdate, wordDelete, wordAddBulk } from '../controllers/wordController.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', wordList);
router.post('/add', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), wordAdd);
// Dùng upload.any() để nhận các file có tên động (ví dụ: image_0, audio_0, image_1, audio_1)
router.post('/addbulk', upload.any(), wordAddBulk);
router.get('/:id', wordGetById);
router.put('/update/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), wordUpdate);
router.delete('/delete/:id', wordDelete);

export default router;