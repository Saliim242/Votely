import express from "express";
import {
  register,
  login,
  verifyEmail,
  resendOtp,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
} from "./auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Register a new user
router.post("/register", register);

// Login user
router.post("/login", login);

// Verify email with OTP
router.post("/verify-email", protect, verifyEmail);

// Resend OTP
router.post("/resend-otp", protect, resendOtp);

// Send OTP for password reset
router.post("/forgot-password", forgotPassword);

// Reset password with OTP
router.post("/reset-password", resetPassword);

// Change password
router.post("/change-password", protect, changePassword);

// Logout user
router.post("/logout", logout);

export default router;
