import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const electionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // Election name or label
    description: { type: String }, // Optional: details about this election
    image: { type: String }, // Banner for frontend display
    startDate: { type: Date, required: true }, // When voting starts
    endDate: { type: Date, required: true }, // When voting ends
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "ended"],
      default: "upcoming",
    }, // Election state
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Who created this election
    candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: "Candidate" }], // All candidates competing in this election
  },
  { timestamps: true }
);

electionSchema.plugin(mongoosePaginate);

const Election = mongoose.model("Election", electionSchema);

export default Election;
