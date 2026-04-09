import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import config from "../config";
import {
  findUserByEmail,
  findUserById,
  createUser,
  updateLastLogin,
  emailExists,
  SafeUser,
} from "../models/user.model";

// JWT token banao
const generateTokens = (user: SafeUser) => {
  const payload = {
    userId: user.id,
    tenantId: user.tenant_id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(
    { userId: user.id, tokenId: uuidv4() },
    config.jwtSecret,
    { expiresIn: config.refreshTokenExpiresIn } as jwt.SignOptions,
  );

  return { accessToken, refreshToken };
};

// ── POST /auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. User dhundo
    const user = await findUserByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password",
        code: "INVALID_CREDENTIALS",
      });
      return;
    }

    // 2. Password verify karo
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password",
        code: "INVALID_CREDENTIALS",
      });
      return;
    }

    // 3. Tokens generate karo
    const { password_hash, ...safeUser } = user;
    const { accessToken, refreshToken } = generateTokens(safeUser);

    // 4. Last login update karo
    await updateLastLogin(user.id);

    // 5. Response bhejo
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: safeUser,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: config.jwtExpiresIn,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
};

// ── POST /auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // 1. Email already exist karta hai?
    const exists = await emailExists(email);
    if (exists) {
      res.status(409).json({
        success: false,
        error: "Email already registered",
        code: "EMAIL_EXISTS",
      });
      return;
    }

    // 2. Password hash karo
    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

    // 3. User banao (demo tenant mein)
    const newUser = await createUser({
      tenantId: "00000000-0000-0000-0000-000000000001",
      email,
      passwordHash,
      firstName,
      lastName,
      role: "viewer",
    });

    // 4. Tokens generate karo
    const { accessToken, refreshToken } = generateTokens(newUser);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: newUser,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: config.jwtExpiresIn,
        },
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
};

// ── POST /auth/refresh
export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        error: "Refresh token required",
        code: "TOKEN_REQUIRED",
      });
      return;
    }

    // Token verify karo
    let decoded: any;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch {
      res.status(401).json({
        success: false,
        error: "Invalid or expired refresh token",
        code: "TOKEN_INVALID",
      });
      return;
    }

    // User dhundo
    const user = await findUserById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: "User not found",
        code: "USER_NOT_FOUND",
      });
      return;
    }

    // Naya access token do
    const { password_hash, ...safeUser } = user;
    const { accessToken, refreshToken: newRefreshToken } =
      generateTokens(safeUser);

    res.status(200).json({
      success: true,
      data: {
        tokens: {
          accessToken,
          refreshToken: newRefreshToken,
          expiresIn: config.jwtExpiresIn,
        },
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
};

// ── GET /auth/me
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // Token header se nikalo
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: "Authorization token required",
        code: "TOKEN_REQUIRED",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    // Verify karo
    let decoded: any;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch {
      res.status(401).json({
        success: false,
        error: "Invalid or expired token",
        code: "TOKEN_INVALID",
      });
      return;
    }

    // User fetch karo
    const user = await findUserById(decoded.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
        code: "USER_NOT_FOUND",
      });
      return;
    }

    const { password_hash, ...safeUser } = user;

    res.status(200).json({
      success: true,
      data: { user: safeUser },
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
};
