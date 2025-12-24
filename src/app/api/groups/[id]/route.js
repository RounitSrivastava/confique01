export const runtime = "nodejs";
export const dynamic = "force-dynamic";


import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";
import Group from "@/models/Group";
import Post from "@/models/Post";
import User from "@/models/User";
import Vote from "@/models/Vote"; 
import cloudinary from "@/lib/cloudinary";
import { getCurrentUser } from "@/lib/auth";


/* ===========================
    GET SINGLE GROUP BY ID
=========================== */
export async function GET(req, context) {
    await dbConnect();

    try {
        // 1. AWAIT PARAMS (Next.js 15 Requirement)
        const params = await context.params;
        const groupId = params.id;

        // Stability fix: ensure models are registered
        // eslint-disable-next-line no-unused-vars
        const [_, __] = [Group, User];

        // 2. Validate ObjectId
        if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
            return NextResponse.json(
                { error: `Invalid group ID: ${groupId}` },
                { status: 400 }
            );
        }

        // 3. Fetch Group
        const group = await Group.findById(groupId)
            .select("-__v members")
            .lean();

        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        const membersCount = group.members?.length || 0;

        // 4. Clean data for frontend
        const { members, membersEmails, ...groupData } = group;

        return NextResponse.json({
            group: {
                ...groupData,
                id: group._id.toString(), // Standardize ID field
                membersCount,
            },
        });
    } catch (error) {
        console.error("GET GROUP ERROR:", error);
        return NextResponse.json({ error: "Server error fetching group" }, { status: 500 });
    }
}

/* ===========================
    DELETE GROUP BY ID (SECURE & CASCADING)
=========================== */
export async function DELETE(req, context) {
    await dbConnect();

    try {
        // 1. AWAIT PARAMS
        const params = await context.params;
        const groupId = params.id;

        // Stability fix
        // eslint-disable-next-line no-unused-vars
        const [_, __, ___, ____] = [Group, Post, User, Vote];

        // 2. Validate ObjectId
        if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
            return NextResponse.json(
                { error: "Invalid group ID" },
                { status: 400 }
            );
        }

        // 3. AUTH & OWNER CHECK
        const actor = await getCurrentUser(req);
        if (!actor?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const group = await Group.findById(groupId).select(
            "iconPublicId bannerPublicId slug ownerEmail"
        );

        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        const requesterEmail = actor.email.toLowerCase();
        if (group.ownerEmail.toLowerCase() !== requesterEmail) {
            return NextResponse.json(
                { error: "Forbidden: Only owner can delete group" },
                { status: 403 }
            );
        }

        /* --------------------------------------
            4. CASCADING DELETION LOGIC
        --------------------------------------- */
        
        // A. Delete Group Images from Cloudinary
        try {
            if (group.iconPublicId) await cloudinary.uploader.destroy(group.iconPublicId);
            if (group.bannerPublicId) await cloudinary.uploader.destroy(group.bannerPublicId);
        } catch (err) {
            console.error("Cloudinary group image delete error:", err);
        }

        // B. Delete Post Images & Data
        const posts = await Post.find({ group: groupId }).select("imagePublicId");
        const postIds = posts.map(p => p._id);

        for (const post of posts) {
            if (post.imagePublicId) {
                try {
                    await cloudinary.uploader.destroy(post.imagePublicId);
                } catch (err) {
                    console.error("Cloudinary post image delete error:", err);
                }
            }
        }

        // C. Delete Votes & Posts
        if (postIds.length > 0) {
            await Vote.deleteMany({ postId: { $in: postIds } });
        }
        await Post.deleteMany({ group: groupId });

        // D. Cleanup User References
        await User.updateMany(
            { joinedCommunities: groupId },
            { $pull: { joinedCommunities: groupId } }
        );

        await User.updateMany(
            { createdGroups: groupId },
            { $pull: { createdGroups: groupId } }
        );

        // E. Finally delete the group
        await group.deleteOne();

        return NextResponse.json({
            ok: true,
            deletedGroupId: groupId.toString(),
        });

    } catch (error) {
        console.error("DELETE GROUP ERROR:", error);
        return NextResponse.json({ error: "Failed to delete group" }, { status: 500 });
    }
}