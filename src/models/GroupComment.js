// src/models/GroupComment.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const GroupCommentSchema = new Schema(
  {
    // Every comment belongs to a specific community
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },

    // And a specific post inside that group
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },

    // Author reference
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Denormalized fields
    authorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    authorName: {
      type: String,
      trim: true,
      default: "",
    },

    authorImage: {
      type: String,
      default: null,
    },

    // Comment text
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
      validate: {
        validator: (val) => typeof val === "string" && val.trim().length > 0,
        message: "Comment text cannot be empty",
      },
    },

    // Nested replies
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "GroupComment",
      default: null,
      index: true,
    },

    // Image support
    imageUrl: { type: String, default: null },
    imagePublicId: { type: String, default: null },
    imageMeta: { type: Schema.Types.Mixed, default: null },

    // Soft delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index for faster loading
GroupCommentSchema.index({ post: 1, parentComment: 1, createdAt: 1 });

// ✅ FIXED PRE-SAVE HOOK (NO next())
GroupCommentSchema.pre("save", function () {
  if (typeof this.text === "string") {
    this.text = this.text.trim();
  }

  if (!this.parentComment) this.parentComment = null;

  if (this.imageUrl === "") this.imageUrl = null;
  if (this.imagePublicId === "") this.imagePublicId = null;
});

export default mongoose.models.GroupComment ||
  mongoose.model("GroupComment", GroupCommentSchema);
