import express from 'express';
import { getAllTopics, topicAdd, topicDelete, topicGetById, topicList, topicUpdate, getUserTopics, createUserTopic } from '../controllers/topicController.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get("/list", topicList);
router.get("/topicdropdown", getAllTopics);
router.post("/add", upload.single('image'), topicAdd); 
router.get("/:id", topicGetById);
router.put("/update/:id", upload.single('image'), topicUpdate);
router.delete("/delete/:id", topicDelete);

router.get("/user/my-topics", getUserTopics);
router.post("/user/create", createUserTopic);


export default router;