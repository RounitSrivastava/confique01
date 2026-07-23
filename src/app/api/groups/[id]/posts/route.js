import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";
import Post from "@/models/Post";
import Group from "@/models/Group";
import User from "@/models/User";
import Vote from "@/models/Vote";
import GroupComment from "@/models/GroupComment";
import { getCurrentUser } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import Groq from "groq-sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ---------------------------------
   HELPER: Look up user's vote status
---------------------------------- */
async function getUserVotes(userId, postIds) {
  if (!userId || postIds.length === 0) return {};

  try {
    const votes = await Vote.find({
      userId,
      postId: { $in: postIds },
    })
      .select("postId value")
      .lean();

    return votes.reduce((map, v) => {
      map[v.postId.toString()] = v.value;
      return map;
    }, {});
  } catch (err) {
    console.error("GET USER VOTES ERROR:", err);
    return {};
  }
}

/* ---------------------------------
   GET ALL POSTS FOR A COMMUNITY
---------------------------------- */
export async function GET(req, context) {
  await dbConnect();

  try {
    const params = await context.params;
    const { id: groupId } = params;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json({ error: "Invalid group ID" }, { status: 400 });
    }

    const actor = await getCurrentUser();
    const userId = actor?.id || null;

    const posts = await Post.find({ group: groupId })
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "name username avatar email",
      })
      .select("title content imageUrl author upvotes commentsCount reactions poll createdAt")
      .lean();

    const postIds = posts.map((p) => p._id);
    const userVotesMap = userId ? await getUserVotes(userId, postIds) : {};

    const normalizedPosts = posts.map((post) => {
      const author = post.author || {};
      const postId = post._id.toString();

      return {
        id: postId,
        title: post.title,
        content: post.content || null,
        imageUrl: post.imageUrl || null,

        authorId: author._id || null,
        authorEmail: author.email || null,
        authorName: author.name || author.username || "Unknown",
        authorImage: author.avatar || null,

        upvotes: post.upvotes || 0,
        commentsCount: post.commentsCount || 0,
        reactions: post.reactions || [],
        poll: post.poll || null,
        userVote: userVotesMap[postId] || 0,
        createdAt: post.createdAt,

        isAuthor:
          userId && author._id
            ? author._id.toString() === userId.toString()
            : false,
      };
    });

    return NextResponse.json({ posts: normalizedPosts });
  } catch (error) {
    console.error("GET POSTS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

/* ---------------------------------
   CREATE NEW POST (VERCEL SAFE)
---------------------------------- */
export async function POST(req, context) {
  await dbConnect();

  try {
    const params = await context.params;
    const { id: groupId } = params;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json({ error: "Invalid group ID" }, { status: 400 });
    }

    const actor = await getCurrentUser();
    if (!actor?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔥 image uploaded here and stored in Cloudinary
    const { title, content, imageBase64, poll } = await req.json();

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }
if (imageBase64 && !imageBase64.startsWith("data:image/")) {
  return NextResponse.json(
    { error: "Invalid image format" },
    { status: 400 }
  );
}
    const user = await User.findById(actor.id).select(
      "_id name username avatar email"
    );

    const group = await Group.findById(groupId).select(
      "members ownerEmail"
    );

    if (!user || !group) {
      return NextResponse.json(
        { error: "User or Group not found" },
        { status: 404 }
      );
    }

    const email = actor.email?.toLowerCase();
    const isOwner = group.ownerEmail?.toLowerCase() === email;
    const isMember = group.members.some((id) => id.equals(user._id));

    if (!isOwner && !isMember) {
      return NextResponse.json(
        { error: "Join the community before posting." },
        { status: 403 }
      );
    }
let imageUrl = null;
let imagePublicId = null;

if (imageBase64) {
  const upload = await cloudinary.uploader.upload(imageBase64, {
    folder: "confique_posts",
    resource_type: "image",
  });

  imageUrl = upload.secure_url;
  imagePublicId = upload.public_id;
}

    const post = await Post.create({
  group: group._id,
  title,
  content,
  poll: poll ? { ...poll, isMultiSelect: poll.isMultiSelect || false } : null,
  imageUrl,
  imagePublicId, // 🔥 REQUIRED for delete route
  author: user._id,
  upvotes: 1,
});

    // Auto-upvote creator post
    await Vote.create({
      userId: user._id,
      postId: post._id,
      value: 1,
    });

    // ====================================================
    // 🤖 AI AGENT AUTO-REPLY LOGIC
    // ====================================================
    let initialCommentsCount = 0;
    try {
      const postText = `${title || ""} ${content || ""}`.toLowerCase();
      if (postText.includes("?")) {
        // Find or create AI User
        const aiUser = await User.findOneAndUpdate(
          { email: "ai@confique.com" },
          {
            $setOnInsert: {
              name: "Confique AI",
              username: "confique-ai",
              provider: "local",
            },
          },
          { upsert: true, new: true }
        );

        // Fetch AI Response
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const chatCompletion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `You are a helpful, expert AI assistant participating in a community forum about "${group.category}". Provide a concise, friendly, and highly accurate answer to the user's question. Format your response cleanly.`,
            },
            {
              role: "user",
              content: `Title: ${title}\n\nContent: ${content || ""}`,
            },
          ],
        });

        const aiResponse = chatCompletion.choices?.[0]?.message?.content;

        if (aiResponse) {
          // Add comment
          await GroupComment.create({
            group: group._id,
            post: post._id,
            author: aiUser._id,
            authorEmail: aiUser.email,
            authorName: aiUser.name,
            text: aiResponse,
          });

          // Update post comment count
          post.commentsCount = (post.commentsCount || 0) + 1;
          await post.save();
          initialCommentsCount = 1;
        }
      }
    } catch (aiError) {
      console.error("⚠️ AI Agent Error:", aiError);
    }

    return NextResponse.json(
      {
        post: {
          id: post._id.toString(),
          title: post.title,
          content: post.content || null,
          imageUrl: post.imageUrl || null,

          authorId: user._id,
          authorEmail: user.email,
          authorName: user.name || user.username,
          authorImage: user.avatar || null,

          upvotes: 1,
          commentsCount: initialCommentsCount,
          reactions: [],
          poll: post.poll || null,
          userVote: 1,
          createdAt: post.createdAt,
          isAuthor: true,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST POSTS ROUTE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create post." },
      { status: 500 }
    );
  }
}
