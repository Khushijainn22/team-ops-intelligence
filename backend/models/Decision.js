import mongoose from "mongoose";

const decisionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    context: { type: String },
    constraints: { type: String },
    alternatives: [{ title: String, description: String }],
    outcome: {
      type: String,
      enum: ["pending", "successful", "failed", "revisited"],
      default: "pending",
    },
    tags: [String],
    project: { type: String },
    team: [{ type: String, enum: ['product', 'data', 'leadership', 'operations', 'commercial', 'development'] }],
    madeBy: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
    decisionDate: { type: Date, default: Date.now },
    meetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Decision", decisionSchema);
