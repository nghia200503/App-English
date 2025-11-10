import express from "express";
import { authMe } from "../controllers/userController.js";
import { deleteUser, updateUser, addUser, getUser, userList } from "../controllers/authController.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/me", authMe);

router.get("/list", userList);
router.post('/add', upload.single('avatar'), addUser);
router.get("/:id", getUser);
router.put("/update/:id", upload.single('avatar'), updateUser);
router.delete("/delete/:id", deleteUser);

export default router;