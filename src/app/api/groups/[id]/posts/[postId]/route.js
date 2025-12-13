// src/app/api/groups/[id]/posts/[postId]/route.js

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";
import Post from "@/models/Post";
import Vote from "@/models/Vote";
import GroupComment from "@/models/GroupComment"; 
import cloudinary from "@/lib/cloudinary";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/* ==========================================
    HELPER: Look up user's vote status for a single post
========================================== */
async function getUserVote(userId, postId) {
    if (!userId) return 0;
    try {
        // 🚨 Mongoose Stability Fix
        // eslint-disable-next-line no-unused-vars
        const [_] = [Vote]; 
        
        const vote = await Vote.findOne({ userId, postId }).select('value').lean();
        return vote?.value || 0;
    } catch (error) {
        console.error("GET SINGLE VOTE ERROR:", error);
        return 0;
    }
}

/* ==========================================
    GET /api/groups/[id]/posts/[postId]
    Purpose: Fetch a single post's details.
========================================== */
export async function GET(req, { params }) {
    await dbConnect();

    const postId = params.postId;

    // ✅ 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return NextResponse.json({ error: "Invalid Post ID" }, { status: 400 });
    }

    try {
        const actor = await getCurrentUser(req);
        
        // 🚨 Mongoose Stability Fix
        // eslint-disable-next-line no-unused-vars
        const [_, __] = [Post, Vote]; 
        
        // 2. Fetch the post, populate author data
        let post = await Post.findById(postId)
            .populate({
                path: "author",
                select: "name username avatar email",
            })
            .select("-__v") 
            .lean();

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // 3. Fetch user's vote status
        const userVote = await getUserVote(actor?.id, postId);

        // 4. Clean up and format author data
        const author = post.author || {};
        const authorData = {
            authorEmail: author.email || post.authorEmail,
            authorName: author.name || author.username || post.authorName,
            authorImage: author.avatar || post.authorImage,
            authorId: author._id || post.authorId,
        };

        return NextResponse.json({
            post: {
                ...post,
                ...authorData,
                userVote: userVote, // Current User's Vote Status
                author: undefined, // Remove populated Mongoose object
            },
        });

    } catch (error) {
        console.error("GET SINGLE POST ERROR:", error);
        return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
    }
}


/* ==========================================
    DELETE /api/groups/[id]/posts/[postId]
    Purpose: Securely delete a post and all related data.
========================================== */
export async function DELETE(req, { params }) {
    await dbConnect();

    const postId = params.postId;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return NextResponse.json({ error: "Invalid Post ID" }, { status: 400 });
    }

    try {
        // 🚨 Mongoose Stability Fix (for all models used in cascading delete)
        // eslint-disable-next-line no-unused-vars
        const [_, __, ___] = [Post, Vote, GroupComment]; 
        
        // 1. AUTH & PERMISSION CHECK
        const actor = await getCurrentUser(req);
        if (!actor?.id || !actor?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        // Fetch post to check ownership and image ID
        const post = await Post.findById(postId).select("author imagePublicId group");
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // Check if user is the author
        const isAuthor = post.author.equals(actor.id);
        // NOTE: If you need group owner/admin to delete, check Group model here.
        if (!isAuthor) { 
            return NextResponse.json({ error: "Forbidden: Only the post author can delete this post" }, { status: 403 });
        }

        // 2. DELETE CLOUDINARY ASSET
        if (post.imagePublicId) {
            try {
                await cloudinary.uploader.destroy(post.imagePublicId);
            } catch (err) {
                console.error("Cloudinary post image delete error:", err);
            }
        }
        
        // 3. CASCADING DELETION (Ensuring data integrity)
        // Delete all votes associated with this post
        await Vote.deleteMany({ postId: postId });

        // Delete all comments associated with this post
        await GroupComment.deleteMany({ post: postId });

        // 4. DELETE POST
        await post.deleteOne();

        return NextResponse.json({ ok: true, deletedPostId: postId.toString() });

    } catch (error) {
        console.error("DELETE POST ERROR:", error);
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
}