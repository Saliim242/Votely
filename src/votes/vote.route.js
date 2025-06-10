import express from "express";
import { protect, admin } from "../middlewares/auth.middleware.js";
import {
  getAllVotes,
  getUserVotes,
  getVote,
  castVote,
  deleteVote,
} from "./vote.controller.js";

const router = express.Router();

// Get all votes (admin only)
router.get("/", protect, admin, getAllVotes);

// Get current user's votes
router.get("/me", protect, getUserVotes);

// Get single vote
router.get("/:id", protect, getVote);

// Cast a vote
router.post("/", protect, castVote);

// Delete a vote (admin only)
router.delete("/:id", protect, admin, deleteVote);

export default router;
