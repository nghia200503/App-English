import express from 'express';
import { getAllTopics, topicAdd, topicDelete, topicGetById, topicList, topicUpdate } from '../controllers/topicController.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get("/list", topicList);
router.get("/topicdropdown", getAllTopics);
router.post("/add", upload.single('image'), topicAdd); 
router.get("/:id", topicGetById);
router.put("/update/:id", upload.single('image'), topicUpdate);
router.delete("/delete/:id", topicDelete);


export default router;