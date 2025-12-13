export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";
import Group from "@/models/Group";
import Post from "@/models/Post";
import User from "@/models/User";
import Vote from "@/models/Vote"; // NOTE: Added the Vote model for future-proofing cascading delete
import cloudinary from "@/lib/cloudinary";
import { getCurrentUser } from "@/lib/auth";

/* ===========================
    GET SINGLE GROUP BY ID
=========================== */
export async function GET(req, { params }) {
    await dbConnect();

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return NextResponse.json(
            { error: "Invalid group ID" },
            { status: 400 }
        );
    }

    // Select the necessary fields. 'members' is needed for counting.
    const group = await Group.findById(params.id)
        .select("-__v members")
        .lean();

    if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const membersCount = group.members?.length || 0;

    // Destructure to omit members and membersEmails (if they exist) from the final payload
    const { members, membersEmails, ...groupData } = group;

    return NextResponse.json({
        group: {
            ...groupData,
            membersCount,
        },
    });
}

/* ===========================
    DELETE GROUP BY ID (SECURE & CASCADING)
=========================== */
export async function DELETE(req, { params }) {
    await dbConnect();

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return NextResponse.json(
            { error: "Invalid group ID" },
            { status: 400 }
        );
    }

    /* ------------------------
        1️⃣ AUTH & OWNER CHECK
    ------------------------ */
    const actor = await getCurrentUser(req);
    if (!actor?.email) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    // Fetch the group to check ownership and get asset IDs
    const group = await Group.findById(params.id).select(
        "iconPublicId bannerPublicId slug ownerEmail"
    );

    if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const requesterEmail = actor.email.toLowerCase();
    if (group.ownerEmail !== requesterEmail) {
        return NextResponse.json(
            { error: "Forbidden: Only owner can delete group" },
            { status: 403 }
        );
    }

    const groupId = group._id;

    /* --------------------------------------
        2️⃣ DELETE CLOUDINARY ASSETS
    --------------------------------------- */
    try {
        if (group.iconPublicId)
            await cloudinary.uploader.destroy(group.iconPublicId);
        if (group.bannerPublicId)
            await cloudinary.uploader.destroy(group.bannerPublicId);
    } catch (err) {
        console.error("Cloudinary group image delete error:", err);
    }

    /* --------------------------------------
        3️⃣ DELETE POSTS, VOTES, AND POST IMAGES
        (Cascading Deletion)
    --------------------------------------- */
    // Find posts to get public IDs for cloud deletion
    const posts = await Post.find({ group: groupId }).select("imagePublicId");
    const postIds = posts.map(p => p._id);

    // Delete post images from Cloudinary
    for (const post of posts) {
        if (post.imagePublicId) {
            try {
                await cloudinary.uploader.destroy(post.imagePublicId);
            } catch (err) {
                console.error("Cloudinary post image delete error:", err);
            }
        }
    }

    // Delete all votes associated with these posts
    if (postIds.length > 0) {
        await Vote.deleteMany({ postId: { $in: postIds } });
    }
    
    // Delete all posts in the group
    await Post.deleteMany({ group: groupId });


    /* --------------------------------------
        4️⃣ REMOVE GROUP FROM USERS
    --------------------------------------- */
    // Remove group reference from all users' joinedCommunities
    await User.updateMany(
        { joinedCommunities: groupId },
        { $pull: { joinedCommunities: groupId } }
    );

    // Remove group reference from all users' createdGroups
    await User.updateMany(
        { createdGroups: groupId },
        { $pull: { createdGroups: groupId } }
    );

    /* --------------------------------------
        5️⃣ DELETE GROUP
    --------------------------------------- */
    await group.deleteOne();

    return NextResponse.json({
        ok: true,
        deletedGroupId: groupId.toString(),
    });
}