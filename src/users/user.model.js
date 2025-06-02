import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
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
});

userSchema.plugin(mongoosePaginate);

const User = mongoose.model("User", userSchema);

export default User;
