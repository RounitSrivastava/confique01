import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    // ✅ FIXED CATEGORY (CRITICAL)
    category: {
      type: String,
      required: true,
      trim: true,
      default: "For You",
    },

    // Cloudinary media
    iconUrl: String,
    bannerUrl: String,
    iconPublicId: String,
    bannerPublicId: String,

    iconMeta: mongoose.Schema.Types.Mixed,
    bannerMeta: mongoose.Schema.Types.Mixed,

    ownerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    // ⭐ Source of truth for members
    members: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },

    // Denormalized for sorting only
    membersCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        // Always sync count
        ret.membersCount = ret.members?.length || 0;

        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;

        // Remove heavy fields
        delete ret.members;
        delete ret.membersEmails; // legacy safety

        return ret;
      },
    },
  }
);

/* ---------------------------------------------
   PRE-SAVE HOOK — FINAL & SAFE
----------------------------------------------*/
GroupSchema.pre("save", function () {
  // Normalize name
  if (typeof this.name === "string") {
    this.name = this.name.trim();
  }

  // Normalize owner email
  if (typeof this.ownerEmail === "string") {
    this.ownerEmail = this.ownerEmail.trim().toLowerCase();
  }

  // Auto-generate slug
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // ✅ CATEGORY NORMALIZATION (MOST IMPORTANT FIX)
  if (typeof this.category === "string") {
    this.category = this.category
      .trim()
      .toLowerCase()
      .replace(/^./, (c) => c.toUpperCase());
  } else {
    this.category = "For You";
  }

  // Sync membersCount
  if (Array.isArray(this.members)) {
    this.membersCount = this.members.length;
  } else {
    this.membersCount = 0;
  }
});

export default mongoose.models.Group ||
  mongoose.model("Group", GroupSchema);
