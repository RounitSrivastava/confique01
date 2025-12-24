import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";
import GroupComment from "@/models/GroupComment";
import Post from "@/models/Post";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/* ==========================================
   GET COMMENTS
   Route: /api/groups/[id]/posts/[postId]/comments
========================================== */
export async function GET(req, context) {
  await dbConnect();

  try {
    const { id: groupId, postId } = context.params;

    // ✅ Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(groupId) ||
      !mongoose.Types.ObjectId.isValid(postId)
    ) {
      return NextResponse.json(
        { error: "Invalid Group or Post ID." },
        { status: 400 }
      );
    }

    // ✅ Fetch comments
    const comments = await GroupComment.find({
      group: groupId,
      post: postId,
      isDeleted: false,
    })
      .sort({ createdAt: 1 })
      .lean();

    // ✅ Frontend-compatible response (FIXED)
    const mappedComments = comments.map((c) => ({
      id: c._id.toString(),
      postId: c.post.toString(),
      author: c.authorName || c.authorEmail?.split("@")[0] || "User",
      authorEmail: c.authorEmail || null,
      authorImage: c.authorImage || null, // already normalized at save-time
      text: c.text,
      parentId: c.parentComment ? c.parentComment.toString() : null,
      createdAt: c.createdAt,
    }));

    return NextResponse.json(
      { comments: mappedComments },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET COMMENTS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments." },
      { status: 500 }
    );
  }
}

/* ==========================================
   POST COMMENT
   Route: /api/groups/[id]/posts/[postId]/comments
========================================== */
export async function POST(req, context) {
  await dbConnect();

  try {
    const { id: groupId, postId } = context.params;

    const actor = await getCurrentUser();
    const userId = actor?.id;

    // ✅ Auth check
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Must be logged in to comment." },
        { status: 401 }
      );
    }

    // ✅ Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(groupId) ||
      !mongoose.Types.ObjectId.isValid(postId)
    ) {
      return NextResponse.json(
        { error: "Invalid Group or Post ID." },
        { status: 400 }
      );
    }

    const { text, parentId } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Comment text cannot be empty." },
        { status: 400 }
      );
    }

    if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
      return NextResponse.json(
        { error: "Invalid parent comment ID." },
        { status: 400 }
      );
    }

    // ✅ Load user (FIX: include avatarUrl)
    const user = await User.findById(userId)
      .select("name username avatar avatarUrl email")
      .lean();

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "User not found or email missing." },
        { status: 404 }
      );
    }

    // ✅ Ensure post exists
    const postExists = await Post.exists({ _id: postId });
    if (!postExists) {
      return NextResponse.json(
        { error: "Post not found." },
        { status: 404 }
      );
    }

    // ✅ Create comment (FIXED AVATAR SOURCE)
    const newComment = await GroupComment.create({
      group: groupId,
      post: postId,
      author: userId,
      authorEmail: user.email,
      authorName: user.name || user.username || "",
      authorImage: user.avatarUrl || user.avatar || null,
      text: text.trim(),
      parentComment: parentId || null,
    });

    // ✅ Increment comment count
    await Post.updateOne(
      { _id: postId },
      { $inc: { commentsCount: 1 } }
    );

    // ✅ Frontend-compatible response
    const responseComment = {
      id: newComment._id.toString(),
      postId,
      author:
        newComment.authorName ||
        newComment.authorEmail?.split("@")[0] ||
        "User",
      authorEmail: newComment.authorEmail,
      authorImage: newComment.authorImage || null,
      text: newComment.text,
      parentId: newComment.parentComment
        ? newComment.parentComment.toString()
        : null,
      createdAt: newComment.createdAt,
    };

    return NextResponse.json(
      {
        comment: responseComment,
        newComment: responseComment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST COMMENT ERROR:", error);

    if (error.name === "ValidationError") {
      const msg = Object.values(error.errors)
        .map((e) => e.message)
        .join(", ");
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create comment.", details: error.message },
      { status: 500 }
    );
  }
}
