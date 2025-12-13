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
========================================== */
export async function GET(req, context) {
  await dbConnect();

  try {
    const { params } = context;
    const { postId } = params;

    // Stability fix
    // eslint-disable-next-line no-unused-vars
    const [_, __] = [GroupComment, Post];

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { error: "Invalid Post ID." },
        { status: 400 }
      );
    }

    const comments = await GroupComment.find({
      post: postId,
      isDeleted: false,
    })
      .sort({ createdAt: 1 })
      .lean();

    const mappedComments = comments.map((c) => ({
      id: c._id.toString(),
      postId: c.post.toString(),
      authorEmail: c.authorEmail,
      authorName: c.authorName || c.authorEmail.split("@")[0],
      authorImage: c.authorImage || null,
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
========================================== */
export async function POST(req, context) {
  await dbConnect();

  try {
    const { params } = context;
    const { id: groupId, postId } = params;

    // Stability fix
    // eslint-disable-next-line no-unused-vars
    const [_, __, ___] = [GroupComment, Post, User];

    const actor = await getCurrentUser(req);
    const userId = actor?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Must be logged in to comment." },
        { status: 401 }
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(groupId) ||
      !mongoose.Types.ObjectId.isValid(postId)
    ) {
      return NextResponse.json(
        { error: "Invalid Group or Post ID." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { text, parentId } = body;

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

    const user = await User.findById(userId)
      .select("name username avatar email")
      .lean();

    const postExists = await Post.exists({ _id: postId });

    if (!user || !postExists) {
      return NextResponse.json(
        { error: "Post or User not found." },
        { status: 404 }
      );
    }

    const newComment = await GroupComment.create({
      group: new mongoose.Types.ObjectId(groupId),
      post: new mongoose.Types.ObjectId(postId),
      author: new mongoose.Types.ObjectId(userId),
      authorEmail: user.email,
      authorName: user.name || user.username,
      authorImage: user.avatar || null,
      text: text.trim(),
      parentComment: parentId
        ? new mongoose.Types.ObjectId(parentId)
        : null,
    });

    await Post.findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 },
    });

    return NextResponse.json(
      {
        newComment: {
          id: newComment._id.toString(),
          postId,
          authorEmail: newComment.authorEmail,
          authorName: newComment.authorName,
          authorImage: newComment.authorImage,
          text: newComment.text,
          parentId: newComment.parentComment
            ? newComment.parentComment.toString()
            : null,
          createdAt: newComment.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST COMMENT ERROR:",
      error.name,
      error.message
    );

    if (error.name === "ValidationError") {
      const msg = Object.values(error.errors)
        .map((e) => e.message)
        .join(", ");
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create comment." },
      { status: 500 }
    );
  }
}
