import express from "express";
import { protect, admin } from "../middlewares/auth.middleware.js";
import {
  isOwnerOrAdmin,
  checkRole,
  restrictTo,
} from "../middlewares/roles.check.middleware.js";
import {
  getAllElections,
  getElection,
  createElection,
  updateElection,
  deleteElection,
  getElectionCandidates,
  voteInElection,
  getElectionResults,
} from "./elections.controller.js";

const router = express.Router();

// GET /api/elections - Get all elections
router.get("/", protect, getAllElections);

// GET /api/elections/:id - Get single election
router.get("/:id", protect, getElection);

// POST /api/elections - Create a new election
router.post("/", protect, checkRole("Admin"), createElection);

// PUT /api/elections/:id - Update an election
router.put(
  "/:id",
  protect,
  isOwnerOrAdmin((req) => req.params.id),
  // checkRole("Admin"),
  updateElection
);

// DELETE /api/elections/:id - Delete an election
router.delete(
  "/:id",
  protect,
  isOwnerOrAdmin((req) => req.params.id),
  deleteElection
);

// GET /api/elections/:id/candidates - Get all candidates for an election
router.get("/:id/candidates", getElectionCandidates);

// POST /api/elections/:id/vote - Vote in an election
router.post("/:id/vote", protect, voteInElection);

// GET /api/elections/:id/results - Get election results
router.get("/:id/results", protect, getElectionResults);

export default router;
