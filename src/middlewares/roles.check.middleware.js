/**
 * Middleware to restrict access based on user roles
 * Must be used after the protect middleware
 * @param {Array} roles - Array of roles allowed to access the route
 * @returns {Function} - Express middleware function
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: false,
        message: "Not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: false,
        message: `Role '${req.user.role}' is not allowed to perform this action`,
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is the owner of a resource or an admin
 * @param {Function} getResourceUserId - Function to get the user ID from the resource
 * @returns {Function} - Express middleware function
 */
export const isOwnerOrAdmin = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: false,
          message: "Not authenticated",
        });
      }

      // Admin can access any resource
      if (req.user.role === "Admin") {
        return next();
      }

      // Get the user ID of the resource owner
      const resourceUserId = await getResourceUserId(req);

      // Check if the current user is the owner
      if (req.user._id.toString() !== resourceUserId.toString()) {
        return res.status(403).json({
          status: false,
          message: "Not authorized to access this resource",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
