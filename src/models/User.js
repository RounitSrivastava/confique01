import mongoose from "mongoose";
const { Schema, models, model } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, trim: true, default: "" },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // 🔐 Local auth only (Google users won't have this)
    passwordHash: {
      type: String,
      required: false,     // ✅ CHANGED
      select: false,
    },

    // 🔑 Auth provider
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
      index: true,
    },

    // 🟢 Google account ID
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    // Custom username
    username: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      lowercase: true,
      index: true,
    },

    // ----------------------------
    // Avatar Fields
    // ----------------------------
    avatar: { type: String, default: null },
    avatarUrl: { type: String, default: null },
    avatarPublicId: { type: String, default: null },
    avatarMeta: { type: Schema.Types.Mixed, default: null },

    // ----------------------------
    // Profile Fields
    // ----------------------------
    bio: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    website: { type: String, trim: true, default: "" },

    // Communities
    createdGroups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
    joinedCommunities: [{ type: Schema.Types.ObjectId, ref: "Group" }],
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        if (ret._id) {
          ret.id = String(ret._id);
          delete ret._id;
        }
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

// ----------------------------------------------------
// PRE-SAVE NORMALIZATION
// ----------------------------------------------------
UserSchema.pre("save", function () {
  if (this.email) this.email = this.email.trim().toLowerCase();
  if (this.name) this.name = this.name.trim();
  if (this.username) this.username = this.username.trim().toLowerCase();

  if (!this.joinedCommunities) this.joinedCommunities = [];
  if (!this.createdGroups) this.createdGroups = [];

  if (this.avatarUrl === "") this.avatarUrl = null;
  if (this.avatarPublicId === "") this.avatarPublicId = null;
});

// ----------------------------------------------------
// INSTANCE METHOD: Get avatar safely
// ----------------------------------------------------
UserSchema.methods.getAvatar = function () {
  return (
    this.avatarUrl ||
    this.avatar ||
    "https://ui-avatars.com/api/?background=333&color=fff&name=" +
      encodeURIComponent(this.name || this.username || "User")
  );
};

// ----------------------------------------------------
export default models.User || model("User", UserSchema);
