// models/Vote.js

import mongoose, { Schema } from 'mongoose';

const VoteSchema = new Schema({
    // Reference to the User who cast the vote
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    
    // Reference to the Post being voted on
    postId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Post', 
        required: true 
    },
    
    // The vote value: 1 for upvote, -1 for downvote
    value: { 
        type: Number, 
        enum: [1, -1], // Only allow upvote or downvote
        required: true 
    },

    // Ensures one unique vote per user per post. 
    // This unique compound key is generated in the pre-validate hook.
    uniqueVote: {
        type: String,
        required: true,
        unique: true,
    }
}, {
    timestamps: true 
});

// 🚨 FIX: Removed 'next' parameter and next() call.
// The logic is synchronous, so Mongoose uses the non-callback signature.
VoteSchema.pre('validate', function() {
    if (this.userId && this.postId) {
        // Generate a unique identifier string using the two ObjectIds
        this.uniqueVote = `${this.userId.toString()}:${this.postId.toString()}`;
    }
});

// Index for fast lookup by user and post, also enforces uniqueness at the DB level
VoteSchema.index({ userId: 1, postId: 1 }, { unique: true });

export default mongoose.models.Vote || mongoose.model('Vote', VoteSchema);