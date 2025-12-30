import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";
import Post from "@/models/Post";
import Vote from "@/models/Vote";
import GroupComment from "@/models/GroupComment";
import cloudinary from "@/lib/cloudinary";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ==========================================
   HELPER: Look up user's vote status
========================================== */
async function getUserVote(userId, postId) {
  if (!userId) return 0;

  try {
    const vote = await Vote.findOne({ userId, postId })
      .select("value")
      .lean();

    return vote?.value || 0;
  } catch (error) {
    console.error("GET SINGLE VOTE ERROR:", error);
    return 0;
  }
}

/* ==========================================
   GET SINGLE POST DETAILS
========================================== */
export async function GET(req, context) {
  await dbConnect();

  try {
    // 1. AWAIT PARAMS (Next.js 15 Requirement)
    const params = await context.params;
    const { postId } = params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { error: "Invalid Post ID" },
        { status: 400 }
      );
    }

    const actor = await getCurrentUser();

    const post = await Post.findById(postId)
      .populate({
        path: "author",
        select: "name username avatar avatarUrl email",
      })
      .select("title content imageUrl upvotes commentsCount createdAt author")
      .lean();

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const userVote = await getUserVote(actor?.id, postId);
    const author = post.author || {};

    return NextResponse.json({
      post: {
        id: post._id.toString(),
        title: post.title,
        content: post.content || null,
        imageUrl: post.imageUrl || null,

        // 🔥 ALWAYS LIVE USER DATA
        authorId: author._id || null,
        authorEmail: author.email || null,
        authorName: author.name || author.username || "Unknown",
        authorImage: author.avatarUrl || author.avatar || null,

        upvotes: post.upvotes || 0,
        commentsCount: post.commentsCount || 0,
        userVote,
        createdAt: post.createdAt,
        
        // Let the frontend know if the viewer can manage this post
        isAuthor: actor?.id ? author._id?.toString() === actor.id.toString() : false,
      },
    });
  } catch (error) {
    console.error("GET SINGLE POST ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

/* ==========================================
   DELETE POST (SECURE & CASCADING)
========================================== */
export async function DELETE(req, context) {
  await dbConnect();

  try {
    // 1. AWAIT PARAMS
    const params = await context.params;
    const { postId } = params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { error: "Invalid Post ID" },
        { status: 400 }
      );
    }

    const actor = await getCurrentUser();
    if (!actor?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch the post and its community to check for admin/owner rights
    const post = await Post.findById(postId)
      .select("author imagePublicId group")
      .populate("group", "ownerEmail");

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    // Permission Logic: Author OR Community Owner can delete
    const isAuthor = post.author?.toString() === actor.id.toString();
    const isCommunityOwner = post.group?.ownerEmail?.toLowerCase() === actor.email?.toLowerCase();

    if (!isAuthor && !isCommunityOwner) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to delete this post" },
        { status: 403 }
      );
    }

    // Delete Cloudinary image
    if (post.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(post.imagePublicId);
      } catch (err) {
        console.error("Cloudinary delete error:", err);
      }
    }

    // Cascading cleanup
    await Vote.deleteMany({ postId });
    await GroupComment.deleteMany({ post: postId });

    await post.deleteOne();

    return NextResponse.json({
      ok: true,
      deletedPostId: postId,
    });
  } catch (error) {
    console.error("DELETE POST ERROR:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}