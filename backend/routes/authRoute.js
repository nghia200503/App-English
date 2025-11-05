import express from "express";
import { loginUser, logoutUser, registerUser, refreshToken, userList, getUser, deleteUser, updateUser, addUser } from "../controllers/authController.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/logout", logoutUser);
router.post("/refresh", refreshToken);

router.get("/list", userList);
router.post('/add', upload.single('avatar'), addUser);
router.get("/users/:id", getUser);
router.put("/users/:id", upload.single('avatar'), updateUser);
router.delete("/users/:id", deleteUser);

export default router;
