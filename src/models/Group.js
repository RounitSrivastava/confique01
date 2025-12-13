import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },

        slug: { type: String, unique: true, index: true, trim: true },

        description: { type: String, trim: true, default: "" },

        category: { type: String, default: "Tech", trim: true },

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

        // ----------------------------------------------------
        // ⭐ MODIFIED: Use User IDs for membership (The Source of Truth)
        // ----------------------------------------------------
        members: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
            default: [],
        },

        // ----------------------------------------------------
        // ❌ REMOVED: Legacy membersEmails field
        // ----------------------------------------------------

        /**
         * Members count should be derived from the 'members' array length.
         * Keeping this field denormalized *only* if required for direct sorting/indexing
         * without calculating size on read. We will update it only when necessary.
         */
        membersCount: { type: Number, default: 0, min: 0 },
    },

    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                // Ensure the membersCount reflects the actual length of the members array on response
                ret.membersCount = ret.members?.length || 0;
                
                ret.id = String(ret._id);
                delete ret._id;
                delete ret.__v;
                
                // Also delete the members array from the final JSON output 
                // unless explicitly populated and needed by the API handler.
                delete ret.members;
                
                // ❌ Ensure legacy field is deleted if it still exists in the DB
                delete ret.membersEmails; 
                
                return ret;
            },
        },
    }
);

/* ---------------------------------------------
    PRE-SAVE HOOK (MODIFIED) — Normalize + Sync Slug/Owner/Count
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

    // Auto-generate slug if missing
    if (!this.slug && this.name) {
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, "")
            .replace(/-+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    // ⭐ NEW SYNC: Sync membersCount from the actual 'members' array length
    if (Array.isArray(this.members)) {
        this.membersCount = this.members.length;
    } else {
        this.membersCount = 0;
    }
});

export default mongoose.models.Group ||
    mongoose.model("Group", GroupSchema);