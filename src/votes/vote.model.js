import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const voteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Voter ID
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    }, // Election context
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    }, // Voted candidate
    votedAt: { type: Date, default: Date.now }, // When the vote was cast
  },
  { timestamps: true }
);

voteSchema.index({ userId: 1, electionId: 1 }, { unique: true }); // Prevent multiple votes

voteSchema.plugin(mongoosePaginate);

const Vote = mongoose.model("Vote", voteSchema);

export default Vote;
