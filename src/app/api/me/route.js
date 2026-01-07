import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose"; 
import User from "@/models/User"; 
import Group from "@/models/Group"; 
import { getCurrentUser } from "@/lib/auth";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ===================================================
    CONSTANTS & HELPERS
=================================================== */
const HEADERS = { "Cache-Control": "no-store", Vary: "Cookie" };

const normalizeUsername = (raw) => {
    if (!raw || typeof raw !== "string") return "";
    const s = raw.trim().toLowerCase();
    return s
        .replace(/\s+/g, "-")
        .replace(/_+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
};

const deriveUsernameFromEmail = (email) => {
    if (!email) return "";
    return normalizeUsername(email.split("@")[0] || "");
};

/**
 * Builds the user payload, including associated group data.
 */
const buildUserPayload = (u, groups = { created: [], joined: [] }) => {
    const email = u.email || "";
    const name = u.name || "";
    const safeUsername = u.username || normalizeUsername(name) || deriveUsernameFromEmail(email);

    return {
        id: u._id.toString(),
        name,
        displayName: name || safeUsername,
        username: safeUsername,
        email,
        avatar: u.avatar || null,
        bio: u.bio || "",
        location: u.location || "",
        website: u.website || "",
        createdGroups: groups.created,
        joinedGroups: groups.joined,
    };
};

/* ===================================================
    GET → Return authenticated user's data + groups
=================================================== */
/* ===================================================
    GET → Return authenticated user's data + groups
=================================================== */
export async function GET(req) {
    try {
        await dbConnect();
        const actor = await getCurrentUser(); 
        const userId = actor?.id || actor?.userId;

        if (!userId) {
            return NextResponse.json({ user: null, error: "Unauthorized" }, { status: 401, headers: HEADERS });
        }

        const UserModel = mongoose.models.User || User;
        const GroupModel = mongoose.models.Group || Group;

        // 🛡️ FIX: Try to find by ObjectId first, if it fails, find by Email or GoogleId
        let user;
        if (mongoose.Types.ObjectId.isValid(userId)) {
            user = await UserModel.findById(userId).lean();
        } 
        
        // If not found by ID (common for first-time Google logins)
        if (!user) {
            user = await UserModel.findOne({ 
                $or: [
                    { googleId: userId }, 
                    { email: actor.email }
                ] 
            }).lean();
        }

        if (!user) {
            // This is likely a new Google user who hasn't been saved to your DB yet
            return NextResponse.json(
                { user: null, error: "User not found in database" },
                { status: 401, headers: HEADERS }
            );
        }

        // ... rest of your existing groups logic ...

        // Standardize IDs to strings for comparison logic
        const createdIds = (user.createdGroups || []).map(id => id.toString());
        const joinedIds = (user.joinedCommunities || []).map(id => id.toString());
        const uniqueGroupIds = [...new Set([...createdIds, ...joinedIds])].filter(id => mongoose.Types.ObjectId.isValid(id));

        let groups = [];
        if (uniqueGroupIds.length > 0) {
            groups = await GroupModel.find({ _id: { $in: uniqueGroupIds } })
                .select("_id name description ownerEmail members category iconUrl bannerUrl slug")
                .lean();
        }

        const groupsMap = groups.reduce((acc, g) => ({ ...acc, [g._id.toString()]: g }), {});

        const transform = (g, isCreated) => ({
            id: g._id.toString(),
            name: g.name,
            description: g.description,
            ownerEmail: g.ownerEmail,
            membersCount: g.members?.length || 0, 
            iconUrl: g.iconUrl || null,
            bannerUrl: g.bannerUrl || null,
            slug: g.slug || null,
            createdByCurrentUser: isCreated,
            role: isCreated ? "admin" : "member" 
        });

        const allUserGroups = {
            created: createdIds.map(id => groupsMap[id]).filter(Boolean).map(g => transform(g, true)),
            joined: joinedIds.filter(id => !createdIds.includes(id)).map(id => groupsMap[id]).filter(Boolean).map(g => transform(g, false)),
        };

        return NextResponse.json(
            { user: buildUserPayload(user, allUserGroups) }, 
            { status: 200, headers: HEADERS }
        );

    } catch (err) {
        console.error("ME ROUTE ERROR (GET):", err.message);
        return NextResponse.json({ error: "Server error" }, { status: 500, headers: HEADERS });
    }
}

/* ===================================================
    PATCH → Update user profile
=================================================== */
export async function PATCH(req) {
    try {
        await dbConnect();
        const actor = await getCurrentUser();
        const userId = actor?.id || actor?.userId;

        if (!userId) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401, headers: HEADERS }
            );
        }

        const UserModel = mongoose.models.User || User;
        const body = await req.json();
        const { name, bio, location, website, avatar, username } = body || {};

        const updateData = {};
        if (typeof name === "string") updateData.name = name.trim();
        if (typeof bio === "string") updateData.bio = bio.trim();
        if (typeof location === "string") updateData.location = location.trim();
        if (typeof website === "string") updateData.website = website.trim();
        if (typeof avatar === "string") updateData.avatar = avatar;

        if (typeof username === "string") {
            const norm = normalizeUsername(username);
            if (!norm) {
                return NextResponse.json({ error: "Invalid username" }, { status: 400, headers: HEADERS });
            }

            const existing = await UserModel.findOne({
                username: norm,
                _id: { $ne: userId }
            }).select("_id").lean();

            if (existing) {
                return NextResponse.json(
                    { error: "Username already taken" },
                    { status: 409, headers: HEADERS }
                );
            }
            updateData.username = norm;
        }

        if (Object.keys(updateData).length === 0) {
            const user = await UserModel.findById(userId).select("-password").lean();
            return NextResponse.json({ user: buildUserPayload(user) }, { status: 200, headers: HEADERS });
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();

        if (!updatedUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404, headers: HEADERS }
            );
        }

        return NextResponse.json(
            { user: buildUserPayload(updatedUser) },
            { status: 200, headers: HEADERS }
        );

    } catch (err) {
        console.error("ME ROUTE ERROR (PATCH):", err.message);
        if (err.name === "ValidationError") {
            const msg = Object.values(err.errors).map((e) => e.message).join(", ");
            return NextResponse.json({ error: msg }, { status: 400, headers: HEADERS });
        }
        return NextResponse.json({ error: "Server error updating profile" }, { status: 500, headers: HEADERS });
    }
}