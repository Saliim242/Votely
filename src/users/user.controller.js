import User from "./user.model.js";

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    // check if the users are get

    if (!users) {
      return res
        .status(404)
        .json({ status: false, message: "Users not found", data: users });
    }

    res
      .status(200)
      .json({ status: true, message: "Users not found", data: users });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Private/Admin or Self
 */

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin or Self
 */

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */

/**
 * @desc    Get current logged in user
 * @route   GET /api/users/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
