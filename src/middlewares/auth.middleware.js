import jwt from "jsonwebtoken";
import User from "../users/user.model.js";

/**
 * Middleware to protect routes that require authentication
 * Verifies the JWT token and adds the user to the request object
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Not authorized to access this route",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Add user to request object
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          status: false,
          message: "User not found",
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        status: false,
        message: "Not authorized to access this route",
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict access to admin users only
 * Must be used after the protect middleware
 */
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "Admin") {
    next();
  } else {
    return res.status(403).json({
      status: false,
      message: "Not authorized as an admin",
    });
  }
};

/**
 * Middleware to check if user is verified
 * Must be used after the protect middleware
 */
export const verified = (req, res, next) => {
  if (req.user && req.user.isVerified) {
    next();
  } else {
    return res.status(403).json({
      status: false,
      message: "Email not verified",
    });
  }
};
