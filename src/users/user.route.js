import express from "express";
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateProfileImage,
  getMe,
} from "./user.controller.js";
import { protect, admin } from "../middlewares/auth.middleware.js";
import { isOwnerOrAdmin } from "../middlewares/roles.check.middleware.js";

const route = express.Router();

// GET /api/users - Get all users
route.get("/", protect, admin, getAllUsers);

// GET /api/users/me - Get current logged in user
route.get("/me", protect, getMe);

// GET /api/users/:id - Get single user
route.get(
  "/:id",
  protect,
  isOwnerOrAdmin((req) => req.params.id),
  getUser
);

// PUT /api/users/:id - Update a user
route.put(
  "/:id",
  protect,
  isOwnerOrAdmin((req) => req.params.id),
  updateUser
);

// PUT /api/users/:id/profile-image - Update a user's profile image
route.put(
  "/:id/profile-image",
  protect,
  isOwnerOrAdmin((req) => req.params.id),
  updateProfileImage
);

// DELETE /api/users/:id - Delete a user
route.delete("/:id", protect, admin, deleteUser);

export default route;
