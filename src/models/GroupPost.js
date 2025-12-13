import mongoose, { Schema } from "mongoose";

const GroupPostSchema = new mongoose.Schema(
    {
        // Post belongs to a community
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true,
            index: true,
        },

        // ===============================
        // POST CONTENT
        // ===============================
        title: { type: String, required: true, trim: true, maxlength: 300 },
        content: { type: String, trim: true, default: "" },

        // ===============================
        // CLOUDINARY IMAGE SUPPORT
        // ===============================
        imageUrl: { type: String, default: null },      
        imagePublicId: { type: String, default: null }, 
        imageMeta: { type: mongoose.Schema.Types.Mixed, default: null },

        // ===============================
        // AUTHOR INFO
        // ===============================
        // ⭐ Primary reference to the User model
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true, 
            index: true,
        },
        
        // Denormalized/redundant fields (kept for backward compatibility or simple reads)
        authorEmail: { type: String, required: true, lowercase: true, trim: true },
        authorName: { type: String, default: "", trim: true },
        authorImage: { type: String, default: null },

        // ===============================
        // STATS
        // ===============================
        // ➡️ FIX: Removed 'min: 0'. This field stores the net score (upvotes - downvotes).
        upvotes: { type: Number, default: 0 },
        
        commentsCount: { type: Number, default: 0, min: 0 },

        // OPTIONAL: Soft delete support
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

// Speed up listing posts inside a group
GroupPostSchema.index({ group: 1, createdAt: -1 });

// ===============================
// PRE-SAVE SANITIZATION
// ===============================
GroupPostSchema.pre("save", function (next) {
    if (typeof this.authorEmail === "string")
        this.authorEmail = this.authorEmail.toLowerCase().trim();

    if (typeof this.authorName === "string")
        this.authorName = this.authorName.trim();

    if (typeof this.title === "string")
        this.title = this.title.trim();

    if (typeof this.content === "string")
        this.content = this.content.trim();

    if (this.imageUrl === "") this.imageUrl = null;
    if (this.imagePublicId === "") this.imagePublicId = null;

    if (this.imageMeta && typeof this.imageMeta !== "object")
        this.imageMeta = null;

    // ➡️ FIX: Removed the line 'if (this.upvotes < 0) this.upvotes = 0;'
    // This allows the net score to correctly go negative.
    
    // Ensure commentsCount is non-negative
    if (this.commentsCount < 0) this.commentsCount = 0;

    next();
});

// =================================
// ATOMIC COMMENTS COUNTER
// =================================
GroupPostSchema.statics.incrementCommentsCount = async function (postId, delta = 1) {
    if (!postId) throw new Error("postId required");

    const n = Number(delta) || 0;

    const res = await this.findByIdAndUpdate(
        postId,
        { $inc: { commentsCount: n } },
        { new: true }
    ).lean();

    // Reset to 0 if count drops below 0 
    if (res && res.commentsCount < 0) {
        await this.findByIdAndUpdate(postId, { commentsCount: 0 });
        res.commentsCount = 0;
    }

    return res;
};

// Export as Post (recommended)
export default mongoose.models.Post ||
    mongoose.model("Post", GroupPostSchema);