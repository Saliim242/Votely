import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const candidateSchema = new Schema(
  {
    fullName: { type: String, required: true }, // Display name
    description: { type: String }, // Optional campaign bio or summary
    electionId: {
      type: Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    }, // Belongs to one election
    votesCount: { type: Number, default: 0 }, // Updated as votes are cast
    image: { type: String }, // Candidate photo or logo
    createdAt: { type: Date, default: Date.now }, // Creation timestamp
  },
  {
    timestamps: true,
  }
);

candidateSchema.plugin(mongoosePaginate);

const Candidate = mongoose.model("Candidate", candidateSchema);

export default Candidate;
