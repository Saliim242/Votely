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

    res.status(200).json({
      status: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Private/Admin or Self
 */
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    res.status(200).json({
      status: true,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin or Self
 */
export const updateUser = async (req, res, next) => {
  try {
    const { fullName, email, phoneNumber } = req.body;

    // Find user
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res
          .status(400)
          .json({ status: false, message: "Email already in use" });
      }
    }

    // Update user

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    // res.status(200).json({ status: true, message: updatedUser });

    // await user.save();

    res.status(200).json({
      status: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: true,
      message: "User deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile image
 * @route   PUT /api/users/:id/profile-image
 * @access  Private/Admin or Self
 */
export const updateProfileImage = async (req, res, next) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res
        .status(400)
        .json({ status: false, message: "Please upload an image" });
    }

    // Find user
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Update profile image
    user.profileImage = req.file.path;
    await user.save();

    res.status(200).json({
      status: true,
      message: "Profile image updated successfully",
      data: {
        id: user._id,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/users/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      status: true,
      message: "User profile retrieved successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user User Role
 * @route   PUT /api/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    // Find user
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // lets check if the user is an admin
    if (user.role === "Admin") {
      return res
        .status(403)
        .json({ status: false, message: "You cannot update an admin role" });
    }

    // lets check  if the role is valid
    if (!role || (role !== "Admin" && role !== "Voter")) {
      return res.status(400).json({ status: false, message: "Invalid role" });
    }
    // Update user role
    user.role = role;
    await user.save();
    res.status(200).json({
      status: true,
      message: "User role updated successfully",
      data: {
        id: user._id,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
