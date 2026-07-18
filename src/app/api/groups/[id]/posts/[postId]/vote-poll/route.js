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

    const { optionIndex } = await req.json();
    if (typeof optionIndex !== 'number') {
      return NextResponse.json({ error: "Option index is required" }, { status: 400 });
    }

    const post = await Post.findById(postId);
    if (!post || !post.poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    if (optionIndex < 0 || optionIndex >= post.poll.options.length) {
      return NextResponse.json({ error: "Invalid option index" }, { status: 400 });
    }

    const isMultiSelect = post.poll.isMultiSelect;

    // Check if user has already voted for this specific option
    const userHasVotedForThisOption = post.poll.options[optionIndex].votes.includes(userEmail);

    if (userHasVotedForThisOption) {
      // User is toggling their vote OFF for this option
      post.poll.options[optionIndex].votes = post.poll.options[optionIndex].votes.filter(e => e !== userEmail);
    } else {
      // User is voting FOR this option
      if (!isMultiSelect) {
        // If single select, remove user from all other options
        post.poll.options.forEach(opt => {
          opt.votes = opt.votes.filter(email => email !== userEmail);
        });
      }
      post.poll.options[optionIndex].votes.push(userEmail);
    }

    post.markModified('poll');

    // Save
    await post.save();

    return NextResponse.json({ success: true, poll: post.poll });
  } catch (error) {
    console.error("VOTE POLL API ERROR:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
