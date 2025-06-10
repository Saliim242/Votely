import express from "express";
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateProfileImage,
  updateUserRole,
  getMe,
} from "./user.controller.js";
import { protect, admin } from "../middlewares/auth.middleware.js";
import {
  isOwnerOrAdmin,
  restrictTo,
  checkRole,
} from "../middlewares/roles.check.middleware.js";

const route = express.Router();

// GET /api/users - Get all users
route.get("/", protect, checkRole("Admin"), getAllUsers);

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

// PUT /api/users/:id/role - Update a user's role
route.patch(
  "/:id/role",
  protect,
  checkRole("Admin"),

  updateUserRole
);

// DELETE /api/users/:id - Delete a user
route.delete("/:id", protect, checkRole("Admin"), deleteUser);

export default route;
