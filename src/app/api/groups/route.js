export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Group from "@/models/Group";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";
import { getCurrentUser } from "@/lib/auth";

/* ==========================================
    GET → Fetch all groups + user state
========================================== */
export async function GET(req) {
    await dbConnect();

    // 1. Authenticate user to determine membership status
    const actor = await getCurrentUser(req); // { id, email } or null
    let joinedGroupIds = [];
    let createdGroupIds = [];

    if (actor?.id) {
        // 2. Load user's membership data
        const user = await User.findById(actor.id)
            .select("joinedCommunities createdGroups") // Note: Using joinedCommunities if that is your latest User schema name
            .lean();

        if (user) {
            // Note: Use 'joinedCommunities' if that is your final User schema field name.
            joinedGroupIds = (user.joinedCommunities || []).map((id) => id.toString());
            createdGroupIds = (user.createdGroups || []).map((id) => id.toString());
        }
    }

    // 3. Fetch all groups
    const groups = await Group.find().sort({ membersCount: -1 }).lean();

    // 4. Map and clean up group data
    const responseGroups = groups.map((g) => ({
        ...g,
        membersCount: g.members?.length || 0, // Ensure count is from 'members' array
        members: undefined, // Hide the sensitive members array
    }));

    // 5. Return all groups along with the current user's membership state
    return NextResponse.json({
        groups: responseGroups,
        joinedGroupIds,
        createdGroupIds,
    });
}

/* ==========================================
    POST → Create a new group (SECURE)
========================================== */
export async function POST(req) {
    await dbConnect();

    const actor = await getCurrentUser(req);
    // 1. Security Check
    if (!actor?.id || !actor?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, category, iconBase64, bannerBase64 } = body;

    if (!name) {
        return NextResponse.json({ error: "Group name required" }, { status: 400 });
    }

    const slug = name.toLowerCase().trim().replace(/\s+/g, "-");

    let iconUrl = null;
    let bannerUrl = null;
    let iconPublicId = null;
    let bannerPublicId = null;

    // 2. Cloudinary Uploads
    try {
        if (iconBase64) {
            const upload = await cloudinary.uploader.upload(iconBase64, {
                folder: `confique/groups/${slug}`,
                public_id: "icon",
            });
            iconUrl = upload.secure_url;
            iconPublicId = upload.public_id;
        }

        if (bannerBase64) {
            const upload = await cloudinary.uploader.upload(bannerBase64, {
                folder: `confique/groups/${slug}`,
                public_id: "banner",
            });
            bannerUrl = upload.secure_url;
            bannerPublicId = upload.public_id;
        }
    } catch (e) {
        console.error("Cloudinary upload failed:", e);
        return NextResponse.json({ error: "Image upload failed." }, { status: 500 });
    }

    // 3. Create Group
    const group = await Group.create({
        name,
        description,
        slug,
        category,
        ownerEmail: actor.email.toLowerCase(),
        iconUrl,
        iconPublicId,
        bannerUrl,
        bannerPublicId,
        members: [actor.id], // Initialize with the User ID
        membersCount: 1,
    });

    // 4. Update User's membership lists (Atomic Sync)
    await User.findByIdAndUpdate(actor.id, {
        $addToSet: {
            createdGroups: group._id, // Add to created list
            joinedCommunities: group._id, // Add to joined list
        },
    });

    // 5. Response
    const groupResponse = group.toObject();
    groupResponse.members = undefined;

    return NextResponse.json({ group: groupResponse }, { status: 201 });
}