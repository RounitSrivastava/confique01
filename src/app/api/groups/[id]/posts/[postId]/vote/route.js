// src/app/api/groups/[id]/posts/[postId]/vote/route.js

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";
import Post from "@/models/Post";
import Vote from "@/models/Vote";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/* ==========================================
    POST /api/groups/[id]/posts/[postId]/vote
    Handles persistent vote creation, update, or deletion.
========================================== */
export async function POST(req, { params }) {
    await dbConnect();

    try {
        // Mongoose Stability Fix (Ensures models are registered)
        // eslint-disable-next-line no-unused-vars
        const [_, __] = [Post, Vote]; 

        const actor = await getCurrentUser(req);
        const userId = actor?.id;

        // 1. AUTH CHECK
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized. Must be logged in to vote." }, { status: 401 });
        }

        const postId = params.postId;
        const body = await req.json();
        const newVoteValue = body.vote; // Expected to be 1, -1, or 0

        // 2. VALIDATION
        if (!mongoose.Types.ObjectId.isValid(postId) || !params.id) {
            return NextResponse.json({ error: "Invalid Post or Group ID." }, { status: 400 });
        }
        if (![1, -1, 0].includes(newVoteValue)) {
            return NextResponse.json({ error: "Invalid vote value. Must be 1, -1, or 0." }, { status: 400 });
        }
        
        // 3. FIND EXISTING VOTE
        const existingVote = await Vote.findOne({
            userId: userId,
            postId: postId,
        });

        let postUpdate = { $inc: { upvotes: 0 } }; // Default: no score change
        let status = 200;

        if (newVoteValue === 0) {
            // Case 1: DELETE (Remove Vote)
            if (existingVote) {
                const valueChange = existingVote.value * -1; // e.g., 1 becomes -1, -1 becomes +1
                postUpdate = { $inc: { upvotes: valueChange } };
                await existingVote.deleteOne();
                status = 200;
            }
        } else {
            // Case 2: CREATE or UPDATE (Upvote or Downvote)
            const targetValue = newVoteValue === 1 ? 1 : -1;
            
            if (existingVote) {
                // Update Vote
                if (existingVote.value !== targetValue) {
                    // Score change calculation: New value minus old value
                    const scoreChange = targetValue - existingVote.value; 
                    postUpdate = { $inc: { upvotes: scoreChange } };
                    existingVote.value = targetValue;
                    await existingVote.save();
                } else {
                    postUpdate = { $inc: { upvotes: 0 } };
                }
            } else {
                // Create New Vote
                postUpdate = { $inc: { upvotes: targetValue } };
                await Vote.create({
                    userId: userId,
                    postId: postId,
                    value: targetValue,
                });
                status = 201; 
            }
        }
        
        // 4. UPDATE POST SCORE
        if (postUpdate.$inc.upvotes !== 0) {
            await Post.findByIdAndUpdate(postId, postUpdate);
        }

        return NextResponse.json({ 
            success: true, 
            voteStatus: newVoteValue,
            scoreChange: postUpdate.$inc.upvotes,
        }, { status: status });

    } catch (error) {
        console.error("VOTE POST ROUTE CRITICAL ERROR:", error);
        return NextResponse.json(
            { error: "Failed to process vote." },
            { status: 500 }
        );
    }
}