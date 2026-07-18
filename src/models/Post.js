// models/Post.js
import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    /* ------------------------------------
       GROUP REFERENCE
    ------------------------------------ */
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },

    /* ------------------------------------
       POST CONTENT
    ------------------------------------ */
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    content: {
      type: String,
      trim: true,
      default: "",
    },

    /* ------------------------------------
       CLOUDINARY IMAGE SUPPORT
    ------------------------------------ */
    imageUrl: {
      type: String,
      default: null,
    },
    imagePublicId: {
      type: String,
      default: null,
    },
    imageMeta: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    /* ------------------------------------
       AUTHOR (SOURCE OF TRUTH)
    ------------------------------------ */
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ⚠️ Backward compatibility only
    authorEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },
    authorName: {
      type: String,
      trim: true,
      default: null,
    },
    authorImage: {
      type: String,
      default: null,
    },

    /* ------------------------------------
       STATS
    ------------------------------------ */
    upvotes: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    /* ------------------------------------
       REACTIONS & POLLS
    ------------------------------------ */
    reactions: {
      type: [
        {
          emoji: String,
          users: [String], // Array of user emails
        }
      ],
      default: [],
    },
    poll: {
      type: {
        question: String,
        isMultiSelect: { type: Boolean, default: false },
        options: [
          {
            text: String,
            votes: [String], // Array of user emails
          }
        ],
      },
      default: null,
    },

    /* ------------------------------------
       SOFT DELETE
    ------------------------------------ */
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
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

/* ------------------------------------
   INDEXES
------------------------------------ */
PostSchema.index({ group: 1, createdAt: -1 });

/* ------------------------------------
   PRE-SAVE SANITIZATION (SAFE)
------------------------------------ */
PostSchema.pre("save", function () {
  if (typeof this.authorEmail === "string") {
    this.authorEmail = this.authorEmail.toLowerCase().trim();
  }

  if (typeof this.authorName === "string") {
    this.authorName = this.authorName.trim();
  }

  if (typeof this.title === "string") {
    this.title = this.title.trim();
  }

  if (typeof this.content === "string") {
    this.content = this.content.trim();
  }

  if (this.imageUrl === "") this.imageUrl = null;
  if (this.imagePublicId === "") this.imagePublicId = null;

  if (this.imageMeta && typeof this.imageMeta !== "object") {
    this.imageMeta = null;
  }

  if (typeof this.commentsCount !== "number" || this.commentsCount < 0) {
    this.commentsCount = 0;
  }
});

/* ------------------------------------
   ATOMIC COMMENTS COUNTER
------------------------------------ */
PostSchema.statics.incrementCommentsCount = async function (
  postId,
  delta = 1
) {
  if (!postId) throw new Error("postId required");

  const n = Number(delta) || 0;

  const updated = await this.findByIdAndUpdate(
    postId,
    { $inc: { commentsCount: n } },
    { new: true }
  );

  if (updated && updated.commentsCount < 0) {
    updated.commentsCount = 0;
    await updated.save();
  }

  return updated;
};

/* ------------------------------------
   MODEL EXPORT (NEXT.JS SAFE)
------------------------------------ */
const Post =
  mongoose.models.Post || mongoose.model("Post", PostSchema);

export default Post;
