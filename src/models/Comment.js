import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
    {
        // ------------------------------------
        // 1. Group Reference (Renamed from groupId to group)
        // ------------------------------------
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true,
            index: true,
        },

        // ------------------------------------
        // 2. Post Reference (Renamed from postId to post)
        // ------------------------------------
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true,
            index: true,
        },

        // ------------------------------------
        // 3. Author Reference (Added 'author' field)
        // ------------------------------------
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // Denormalized/redundant fields (kept for compatibility and quick reads)
        authorEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        authorName: {
            type: String,
            trim: true,
        },

        authorImage: {
            type: String,
            default: null,
        },

        text: {
            type: String,
            required: true,
            trim: true,
        },

        // ------------------------------------
        // 4. Nested Reply Reference (Renamed from parentId to parentComment)
        // ------------------------------------
        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            // Note: The ref should point to the model name being defined, typically "Comment" or "GroupComment"
            ref: "Comment", 
            default: null,
            index: true,
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

// Index for efficient fetching of comments for a specific post
CommentSchema.index({ post: 1, parentComment: 1, createdAt: 1 });

export default mongoose.models.Comment ||
    mongoose.model("Comment", CommentSchema);