// models/Post.js
import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    // ------------------------------------
    // 1. Group Reference 
    // ------------------------------------
    group: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Group", 
        required: true 
    },
    
    title: { type: String, required: true, trim: true },
    content: { type: String, trim: true },
    
    // ------------------------------------
    // 2. Author Reference (Source of Truth)
    // ------------------------------------
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    
    // Denormalized/redundant fields (kept for compatibility and quick reads)
    authorEmail: { type: String, lowercase: true, trim: true },
    authorName: { type: String, trim: true },
    authorImage: { type: String, default: null },
    
    imageUrl: String,
    
    // ➡️ CRITICAL FIX: Removed 'min: 0'. This field stores the net score (Upvotes - Downvotes)
    upvotes: { 
        type: Number, 
        default: 0 
    },
    
    commentsCount: { type: Number, default: 0, min: 0 },
    
}, 
{ 
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Adding index for group/creation time for fast fetching
PostSchema.index({ group: 1, createdAt: -1 });

export default mongoose.models.Post || mongoose.model("Post", PostSchema);