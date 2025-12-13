// src/app/api/groups/[id]/posts/route.js

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";
import Post from "@/models/Post";
import Group from "@/models/Group";
import User from "@/models/User";
import Vote from "@/models/Vote"; // IMPORT THE VOTE MODEL
import cloudinary from "@/lib/cloudinary";
import { getCurrentUser } from "@/lib/auth";

// Ensure fresh data on every request
export const dynamic = "force-dynamic";

/* ---------------------------------
    HELPER: Look up user's vote status for multiple posts
---------------------------------- */
async function getUserVotes(userId, postIds) {
    if (!userId || postIds.length === 0) return {};

    try {
        // Find all votes cast by this user on any of the provided post IDs
        const userVotes = await Vote.find({
            userId: userId,
            postId: { $in: postIds }
        })
        .select('postId value') 
        .lean();

        // Map: { postId: voteValue, ... }
        return userVotes.reduce((map, vote) => {
            map[vote.postId.toString()] = vote.value;
            return map;
        }, {});
    } catch (error) {
        console.error("GET USER VOTES ERROR:", error);
        return {};
    }
}


/* ---------------------------------
    GET ALL POSTS FOR A COMMUNITY
---------------------------------- */
export async function GET(req, { params }) {
    await dbConnect();

    // 1. AUTH & SETUP
    const actor = await getCurrentUser(req);
    const userId = actor?.id; // Get the user ID if logged in

    // ✅ Validate group ID
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return NextResponse.json(
            { error: "Invalid group ID" },
            { status: 400 }
        );
    }

    try {
        // 2. Fetch Posts (including the upvotes net score)
        let posts = await Post.find({ group: params.id })
            .sort({ createdAt: -1 })
            .populate({
                path: "author",
                select: "name username avatar email",
            })
            // Select net score, comment count, and necessary fields
            .select("group title content imageUrl author upvotes commentsCount createdAt") 
            .lean();

        const postIds = posts.map(p => p._id);
        
        // 3. Fetch User's Votes (if logged in)
        let userVotesMap = {};
        if (userId) {
            userVotesMap = await getUserVotes(userId, postIds);
        }

        // 4. Map userVote status onto each post
        const postsWithVotes = posts.map(post => {
            const postIdStr = post._id.toString();
            
            // Inject the userVote status (1, -1, or 0)
            const userVote = userVotesMap[postIdStr] || 0; 

            const author = post.author || {};
            const authorData = {
                authorEmail: author.email || post.authorEmail,
                authorName: author.name || author.username || post.authorName,
                authorImage: author.avatar || post.authorImage,
                authorId: author._id || post.authorId,
            };

            return {
                ...post,
                ...authorData,
                upvotes: post.upvotes || 0, // Global Net Score
                userVote: userVote, // Current User's Vote Status (0, 1, or -1)
                author: undefined, // Remove the populated Mongoose object
            };
        });


        return NextResponse.json({ posts: postsWithVotes });
    } catch (error) {
        console.error("GET POSTS ERROR:", error);
        return NextResponse.json(
            { error: "Failed to fetch posts" },
            { status: 500 }
        );
    }
}

/* ---------------------------------
    CREATE NEW POST INSIDE A COMMUNITY
---------------------------------- */
export async function POST(req, { params }) {
    await dbConnect();

    try {
        // 🚨 CRITICAL FIX: Force Mongoose to register models before database operations
        // This resolves the common Next.js Mongoose registration crash.
        // eslint-disable-next-line no-unused-vars
        const [_, __, ___, ____] = [Post, User, Group, Vote]; 
        
        // ✅ Validate group ID
        if (!mongoose.Types.ObjectId.isValid(params.id)) {
            return NextResponse.json(
                { error: "Invalid group ID" },
                { status: 400 }
            );
        }

        /* --------------------
            1️⃣ AUTH (COOKIE BASED)
        -------------------- */
        const actor = await getCurrentUser(req);
        if (!actor?.id || !actor?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { title, content, imageBase64 } = body;

        if (!title) {
            return NextResponse.json(
                { error: "Title is required" },
                { status: 400 }
            );
        }

        /* --------------------
            2️⃣ LOAD USER & GROUP
        -------------------- */
        const user = await User.findById(actor.id).select(
            "_id name username avatar email joinedCommunities"
        );

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 401 }
            );
        }

        const group = await Group.findById(params.id).select(
            "members membersCount ownerEmail slug"
        );

        if (!group) {
            return NextResponse.json(
                { error: "Group not found" },
                { status: 404 }
            );
        }

        /* --------------------
            3️⃣ PERMISSION CHECK & 4️⃣ AUTO-SYNC MEMBERSHIP
        -------------------- */
        const email = actor.email.toLowerCase();
        const isOwner = group.ownerEmail === email;
        const isMember =
            group.members.some((id) => id.equals(user._id)) ||
            user.joinedCommunities.some((id) => id.equals(group._id));

        if (!isOwner && !isMember) {
            return NextResponse.json(
                { error: "Join the community before posting." },
                { status: 403 }
            );
        }

        // Auto-sync membership if necessary
        if (!group.members.some((id) => id.equals(user._id))) {
            group.members.push(user._id);
            group.membersCount = (group.membersCount || 0) + 1;
            await group.save();
        }

        if (!user.joinedCommunities.some((id) => id.equals(group._id))) {
            user.joinedCommunities.push(group._id);
            await user.save();
        }

        /* --------------------
            5️⃣ IMAGE UPLOAD
        -------------------- */
        let imageUrl = null;
        let imagePublicId = null;

        if (imageBase64) {
            try {
                const upload = await cloudinary.uploader.upload(imageBase64, {
                    folder: `confique/groups/${group.slug}/posts`,
                    public_id: `post-${Date.now()}`,
                });

                imageUrl = upload.secure_url;
                imagePublicId = upload.public_id;
            } catch (err) {
                console.error("Cloudinary Upload Error:", err);
                return NextResponse.json(
                    { error: "Image upload failed" },
                    { status: 500 }
                );
            }
        }

        /* --------------------
            6️⃣ CREATE POST (with initial upvote)
        -------------------- */
        const post = await Post.create({
            group: group._id,
            title,
            content,
            imageUrl,
            imagePublicId,
            author: user._id,
            authorEmail: user.email,
            authorName: user.name || user.username,
            authorImage: user.avatar || null,
            upvotes: 1, // Default initial post to 1 upvote (from the author)
        });

        /* --------------------
            7️⃣ CREATE INITIAL VOTE (CRITICAL FOR PERSISTENCE)
        -------------------- */
        await Vote.create({
            userId: user._id,
            postId: post._id,
            value: 1,
        });

        // Add userVote to the response object for immediate UI update on the frontend
        const postForResponse = post.toJSON();
        postForResponse.userVote = 1;


        return NextResponse.json({ post: postForResponse }, { status: 201 });

    } catch (error) { // END OF CATCH BLOCK
        console.error("POST POSTS ROUTE CRITICAL ERROR:", error); 
        
        return NextResponse.json(
            { error: "Failed to create post. Check server logs for details." },
            { status: 500 }
        );
    }
}