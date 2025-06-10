import express from "express";
import { protect, admin } from "../middlewares/auth.middleware.js";
import { isOwnerOrAdmin } from "../middlewares/roles.check.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import {
  getAllCandidates,
  getCandidate,
  createCandidate,
  updateCandidate,
  deleteCandidate,
} from "./candidate.controller.js";

const router = express.Router();

// GET /api/candidates - Get all candidates
router.get("/", getAllCandidates);

// GET /api/candidates/:id - Get single candidate
router.get("/:id", getCandidate);

// POST /api/candidates - Create a new candidate
router.post("/", protect, admin, upload.single("image"), createCandidate);

// PUT /api/candidates/:id - Update a candidate
router.put("/:id", protect, admin, upload.single("image"), updateCandidate);

// DELETE /api/candidates/:id - Delete a candidate
router.delete("/:id", protect, admin, deleteCandidate);

export default router;
