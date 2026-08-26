import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  refreshTokenHash: {
    type: String,
    required: true
  },
  ip: {
    type: String
  },
  userAgent: {
    type: String
  },
  revoke: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

sessionSchema.index({ user: 1 });

const sessionModel = mongoose.model("sessions", sessionSchema);
export default sessionModel;
