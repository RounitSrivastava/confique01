import mongoose from "mongoose";
const { Schema, models, model } = mongoose;

const NotificationSchema = new Schema(
  {
    targetEmail: { type: String, required: true, index: true, lowercase: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    postId: { type: String },
    communitySlug: { type: String },
    communityName: { type: String },
  },
  { timestamps: true }
);

export default models.Notification || model("Notification", NotificationSchema);
