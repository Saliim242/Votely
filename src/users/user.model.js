import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    phoneNumber: {
      type: String,
      match: [/^\+?[0-9]{10,15}$/, "Please add a valid phone number"],
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password in queries
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    votedElections: [{ type: Schema.Types.ObjectId, ref: "Election" }],
    profileImage: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["Admin", "Voter"],
      default: "Voter",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
      default: new Date(),
    },
    registeredDate: {
      type: Date,
      default: new Date(),
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    resetPassowrdToken: String,
    resetPassowrdExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  { timestamps: true }
);

userSchema.plugin(mongoosePaginate);

const User = mongoose.model("User", userSchema);

export default User;
