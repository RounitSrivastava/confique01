  // app/api/groups/[id]/posts/[postId]/vote/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";
import Post from "@/models/Post";
import Vote from "@/models/Vote";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


/* ==========================================
   POST /api/groups/[id]/posts/[postId]/vote
========================================== */
export async function POST(req, context) {
  await dbConnect();

  try {
    const { id: groupId, postId } = context.params;

    if (
      !mongoose.Types.ObjectId.isValid(groupId) ||
      !mongoose.Types.ObjectId.isValid(postId)
    ) {
      return NextResponse.json(
        { error: "Invalid Post or Group ID." },
        { status: 400 }
      );
    }

    const actor = await getCurrentUser(); // ✅ FIXED
    const userId = actor?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Must be logged in to vote." },
        { status: 401 }
      );
    }

    const { vote } = await req.json(); // 1, -1, or 0

    if (![1, -1, 0].includes(vote)) {
      return NextResponse.json(
        { error: "Invalid vote value. Must be 1, -1, or 0." },
        { status: 400 }
      );
    }

    const existingVote = await Vote.findOne({
      userId,
      postId,
    });

    let scoreChange = 0;
    let status = 200;

    if (vote === 0) {
      // REMOVE VOTE
      if (existingVote) {
        scoreChange = -existingVote.value;
        await existingVote.deleteOne();
      }
    } else {
      if (existingVote) {
        if (existingVote.value !== vote) {
          scoreChange = vote - existingVote.value;
          existingVote.value = vote;
          await existingVote.save();
        }
      } else {
        scoreChange = vote;
        await Vote.create({
          userId,
          postId,
          value: vote,
        });
        status = 201;
      }
    }

    if (scoreChange !== 0) {
      await Post.findByIdAndUpdate(postId, {
        $inc: { upvotes: scoreChange },
      });
    }

    return NextResponse.json(
      {
        success: true,
        voteStatus: vote,
        scoreChange,
      },
      { status }
    );
  } catch (error) {
    console.error("VOTE POST ROUTE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to process vote." },
      { status: 500 }
    );
  }
}
