import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";
import Post from "@/models/Post";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req, context) {
  await dbConnect();

  try {
    const params = await context.params;
    const { id: groupId, postId } = params;

    if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const actor = await getCurrentUser();
    if (!actor?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userEmail = actor.email.toLowerCase();

    const { emoji } = await req.json();
    if (!emoji) {
      return NextResponse.json({ error: "Emoji is required" }, { status: 400 });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user already has THIS exact emoji
    let existingTargetReaction = post.reactions.find((r) => r.emoji === emoji);
    let userHadThisEmoji = existingTargetReaction && existingTargetReaction.users.includes(userEmail);

    // Remove the user from ALL emojis first
    post.reactions.forEach((r) => {
      r.users = r.users.filter((u) => u !== userEmail);
    });

    if (!userHadThisEmoji) {
      // User is reacting with a NEW emoji, add them
      let targetReaction = post.reactions.find((r) => r.emoji === emoji);
      if (targetReaction) {
        targetReaction.users.push(userEmail);
      } else {
        post.reactions.push({
          emoji,
          users: [userEmail]
        });
      }
    }

    // Clean up empty reactions
    post.reactions = post.reactions.filter((r) => r.users.length > 0);

    post.markModified('reactions');

    await post.save();

    return NextResponse.json({ success: true, reactions: post.reactions });
  } catch (error) {
    console.error("REACT API ERROR:", error);
    return NextResponse.json({ error: "Failed to react" }, { status: 500 });
  }
}
