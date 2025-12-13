// src/models/User.js
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

        passwordHash: {
            type: String,
            required: true,
            select: false,
        },
        
        // Custom unique username field
        username: {
             type: String,
             trim: true,
             unique: true,
             sparse: true, // Allows null/undefined values to not violate the unique constraint
             lowercase: true,
             index: true,
        },

        // ----------------------------
        // Avatar Fields
        // ----------------------------
        avatar: { type: String, default: "" },
        avatarUrl: { type: String, default: null },
        avatarPublicId: { type: String, default: null },
        avatarMeta: { type: Schema.Types.Mixed, default: null },

        // ----------------------------
        // Profile Fields
        // ----------------------------
        bio: { type: String, trim: true, default: "" },
        location: { type: String, trim: true, default: "" },
        website: { type: String, trim: true, default: "" },

        // =====================================================
        // ⭐ ADDED FIELD — Communities the user has created (Admin/Owner list)
        // =====================================================
        createdGroups: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Group" }
        ],
        
        // =====================================================
        // ⭐ NEW FIELD — Communities the user has joined (Member list)
        // =====================================================
        joinedCommunities: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Group" }
        ],
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

    // Normalize username
    if (this.username) {
        this.username = this.username.trim().toLowerCase();
    }
    
    // Ensure array fields are initialized correctly if they are empty
    if (!this.joinedCommunities) this.joinedCommunities = [];
    if (!this.createdGroups) this.createdGroups = [];


    if (this.avatarUrl === "") this.avatarUrl = null;
    if (this.avatarPublicId === "") this.avatarPublicId = null;

    if (this.avatarMeta && typeof this.avatarMeta !== "object") {
        this.avatarMeta = null;
    }
});

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
UserSchema.statics.updateAvatar = async function (userId, { url, publicId, meta }) {
    return this.findByIdAndUpdate(
        userId,
        {
            avatarUrl: url || null,
            avatarPublicId: publicId || null,
            avatarMeta: meta || null,
        },
        { new: true }
    ).lean();
};

// ----------------------------------------------------
export default models.User || model("User", UserSchema);