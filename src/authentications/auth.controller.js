import User from "../users/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "./Emails/emails.js";

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, phoneNumber } = req.body;

    // Check if required fields are provided
    if (!fullName || !email || !password || !phoneNumber) {
      return res.status(400).json({
        status: false,
        message: "Please provide all required fields",
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        status: false,
        message: "User with this email already exists",
      });
    }

    // Check if phone number is already used
    const phoneExists = await User.findOne({ phoneNumber });

    if (phoneExists) {
      return res.status(400).json({
        status: false,
        message: "User with this Phone Number already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Create user
    const user = await User.create({
      fullName,
      email,

      password: hashedPassword,
      phoneNumber,
      verificationToken: verificationCode,
      verificationTokenExpiresAt,
    });

    // Send verification email
    await sendVerificationEmail(user.email, verificationCode);

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
      // expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(201).json({
      status: true,
      message: "User registered successfully. Please verify your email.",
      token,
      // data: {
      //   id: user._id,
      //   fullName: user.fullName,
      //   email: user.email,
      //   role: user.role,
      //   isVerified: user.isVerified,
      //   phoneNumber: user.phoneNumber,
      //   verificationToken: user.verificationToken,
      //   verificationTokenExpiresAt: user.verificationTokenExpiresAt,
      // },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if the user provided the email and password

    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Please provide your email and password",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "User with this email does not exist",
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: "Invalid credentials",
      });
    }

    // lets check if the user is verified
    if (!user.isVerified) {
      return res.status(401).json({
        status: false,
        message: "Please verify your email before logging in",
      });
    }
    // Check if user is active
    if (user.status != "Active") {
      return res.status(401).json({
        status: false,
        message:
          "Your account has been deactivated. Please contact an administrator.",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
      // expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).json({
      status: true,
      message: "Login successful",

      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: user.isVerified,
        status: user.status,
        lastLogin: user.lastLogin,
        registeredDate: user.registeredDate,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify email with OTP
 * @route   POST /api/auth/verify-email
 * @access  Private
 */
export const verifyEmail = async (req, res, next) => {
  try {
    const { verificationCode } = req.body;
    const { id } = req.user;

    // Check if the user provided the verification code
    if (!verificationCode) {
      return res.status(400).json({
        status: false,
        message: "Verification code is required",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found or invalid token",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        status: false,
        message: "User with this Email is already verified",
      });
    }

    if (
      user.verificationToken !== verificationCode ||
      new Date() > user.verificationTokenExpiresAt
    ) {
      return res.status(400).json({
        status: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    res.status(200).json({
      status: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend OTP
 * @route   POST /api/auth/resend-otp
 * @access  Private
 */
export const resendOtp = async (req, res, next) => {
  try {
    const { id } = req.user;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        status: false,
        message: "Email already verified",
      });
    }

    // Generate new verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.verificationToken = verificationCode;
    user.verificationTokenExpiresAt = verificationTokenExpiresAt;
    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, verificationCode);

    res.status(200).json({
      status: true,
      message: "Verification code sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send OTP for password reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // check if the user provided the email
    if (!email) {
      return res.status(400).json({
        status: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found or invalid email",
      });
    }

    // Generate reset token
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPassowrdToken = resetToken;
    user.resetPassowrdExpiresAt = resetTokenExpiresAt;
    await user.save();

    // Send reset email
    await sendVerificationEmail(email, resetToken);

    res.status(200).json({
      status: true,
      message: "Password reset code sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password with OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    // check if the user provided the email, reset token and new password
    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        status: false,
        message: "Email, reset token and new password are required",
      });
    }

    const user = await User.findOne({
      email,
      resetPassowrdToken: resetToken,
      resetPassowrdExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPassowrdToken = undefined;
    user.resetPassowrdExpiresAt = undefined;
    await user.save();

    res.status(200).json({
      status: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   POST /api/auth/change-password
 * @access  Private
 * @tod     Add change password route
 */

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Check if the user provided the old and new passwords
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        status: false,
        message: "Old and new passwords are required",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // Check if the old password is correct
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: "Old password is not correct",
      });
    }
    // check if the new password is the same as the old password
    if (oldPassword === newPassword) {
      return res.status(400).json({
        status: false,
        message: "New password cannot be the same as the old password",
      });
    }
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      status: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Check User Authentication
 * @route   POST /api/auth/check-auth
 * @tod     Add check auth route
 * @access  Private
 */

export const checkAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "User authenticated successfully",
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: user.isVerified,
        status: user.status,
        lastLogin: user.lastLogin,
        registeredDate: user.registeredDate,
        token: req.token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (req, res, next) => {
  try {
    res.status(200).json({
      status: true,
      message: "Logout successfully",
    });
  } catch (error) {
    next(error);
  }
};
