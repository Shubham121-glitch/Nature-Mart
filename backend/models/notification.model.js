import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  link: {
    type: String
  }
}, {
  timestamps: true
})

notificationSchema.index({ user: 1 })

const notificationModel = mongoose.model("notifications", notificationSchema)

export default notificationModel
