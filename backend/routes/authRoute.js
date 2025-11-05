import express from "express";
import { loginUser, logoutUser, registerUser, refreshToken } from "../controllers/authController.js";

const router = express.Router();
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/logout", logoutUser);
router.post("/refresh", refreshToken);

export default router;
