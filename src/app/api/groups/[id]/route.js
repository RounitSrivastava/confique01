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
        const params = await context.params;
        const groupId = params.id;

        const [_, __] = [Group, User];

        if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
            return NextResponse.json(
                { error: `Invalid group ID: ${groupId}` },
                { status: 400 }
            );
        }

        const group = await Group.findById(groupId)
            .select("-__v members")
            .lean();

        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        const membersCount = group.members?.length || 0;
        const { members, membersEmails, ...groupData } = group;

        return NextResponse.json({
            group: {
                ...groupData,
                id: group._id.toString(),
                membersCount,
            },
        });
    } catch (error) {
        console.error("GET GROUP ERROR:", error);
        return NextResponse.json({ error: "Server error fetching group" }, { status: 500 });
    }
}

/* ===========================
    PATCH (UPDATE) GROUP
=========================== */
export async function PATCH(req, context) {
    await dbConnect();

    try {
        const params = await context.params;
        const groupId = params.id;

        if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
            return NextResponse.json({ error: "Invalid group ID" }, { status: 400 });
        }

        // Auth & Ownership Check
        const actor = await getCurrentUser();
        if (!actor?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        if (group.ownerEmail.toLowerCase() !== actor.email.toLowerCase()) {
            return NextResponse.json(
                { error: "Forbidden: Only the owner can edit this community" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { name, description, category, iconBase64, bannerBase64 } = body;

        const updateData = {};

        // 1. Handle Text fields
        if (name) {
            updateData.name = name;
            updateData.slug = name.toLowerCase().trim().replace(/\s+/g, "-");
        }
        if (description !== undefined) updateData.description = description;
        if (category) updateData.category = category;

        // 2. Handle Icon Update
        if (iconBase64) {
            // Delete old icon from Cloudinary if it exists
            if (group.iconPublicId) {
                try { await cloudinary.uploader.destroy(group.iconPublicId); } catch (e) {}
            }
            const upload = await cloudinary.uploader.upload(iconBase64, {
                folder: `confique/groups/${group.slug || 'updates'}`,
                public_id: `icon_${Date.now()}`,
            });
            updateData.iconUrl = upload.secure_url;
            updateData.iconPublicId = upload.public_id;
        }

        // 3. Handle Banner Update
        if (bannerBase64) {
            // Delete old banner from Cloudinary if it exists
            if (group.bannerPublicId) {
                try { await cloudinary.uploader.destroy(group.bannerPublicId); } catch (e) {}
            }
            const upload = await cloudinary.uploader.upload(bannerBase64, {
                folder: `confique/groups/${group.slug || 'updates'}`,
                public_id: `banner_${Date.now()}`,
            });
            updateData.bannerUrl = upload.secure_url;
            updateData.bannerPublicId = upload.public_id;
        }

        const updatedGroup = await Group.findByIdAndUpdate(
            groupId,
            { $set: updateData },
            { new: true }
        ).lean();

        return NextResponse.json({
            message: "Community updated successfully",
            group: {
                ...updatedGroup,
                id: updatedGroup._id.toString(),
                membersCount: updatedGroup.members?.length || 0,
            },
        });
    } catch (error) {
        console.error("PATCH GROUP ERROR:", error);
        return NextResponse.json({ error: "Failed to update community" }, { status: 500 });
    }
}

/* ===========================
    DELETE GROUP BY ID
=========================== */
export async function DELETE(req, context) {
    await dbConnect();

    try {
        const params = await context.params;
        const groupId = params.id;

        const [_, __, ___, ____] = [Group, Post, User, Vote];

        if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
            return NextResponse.json({ error: "Invalid group ID" }, { status: 400 });
        }

        const actor = await getCurrentUser();
        if (!actor?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const group = await Group.findById(groupId).select(
            "iconPublicId bannerPublicId slug ownerEmail"
        );

        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        if (group.ownerEmail.toLowerCase() !== actor.email.toLowerCase()) {
            return NextResponse.json(
                { error: "Forbidden: Only owner can delete group" },
                { status: 403 }
            );
        }

        // A. Cloudinary Cleanup
        try {
            if (group.iconPublicId) await cloudinary.uploader.destroy(group.iconPublicId);
            if (group.bannerPublicId) await cloudinary.uploader.destroy(group.bannerPublicId);
        } catch (err) {
            console.error("Cloudinary group image delete error:", err);
        }

        // B. Cascade Post Images
        const posts = await Post.find({ group: groupId }).select("imagePublicId");
        const postIds = posts.map(p => p._id);

        for (const post of posts) {
            if (post.imagePublicId) {
                try { await cloudinary.uploader.destroy(post.imagePublicId); } catch (e) {}
            }
        }

        // C. Clean Database
        if (postIds.length > 0) {
            await Vote.deleteMany({ postId: { $in: postIds } });
        }
        await Post.deleteMany({ group: groupId });

        await User.updateMany(
            { joinedCommunities: groupId },
            { $pull: { joinedCommunities: groupId } }
        );

        await User.updateMany(
            { createdGroups: groupId },
            { $pull: { createdGroups: groupId } }
        );

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