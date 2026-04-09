import { Router } from "express";
import { loginValidation, registerValidation } from "../middleware/validate";
import { login, register, refreshToken, getMe } from "./auth.controller";

const router = Router();

// POST /auth/login
router.post("/login", loginValidation, login);

// POST /auth/register
router.post("/register", registerValidation, register);

// POST /auth/refresh
router.post("/refresh", refreshToken);

// GET /auth/me
router.get("/me", getMe);

export default router;
