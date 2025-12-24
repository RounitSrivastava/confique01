import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose"; 
import User from "@/models/User"; 
import Group from "@/models/Group"; 
import { getCurrentUser, extractTokenFromRequest } from "@/lib/auth";
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
    HELPER: Clear stale auth cookies
=================================================== */
function clearAuthCookies(res) {
    const isProd = process.env.NODE_ENV === "production";
    const secureFlag = isProd && process.env.SECURE_COOKIES !== "false";

    const opts = {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: secureFlag,
        maxAge: 0,
    };

    res.cookies.set("confique_token", "", opts);
    res.cookies.set("auth_token", "", opts);
    res.cookies.set("token", "", opts);
}

/* ===================================================
    GET → Return authenticated user's data + groups
=================================================== */
export async function GET(req) {
    await dbConnect();

    try {
        const rawToken = await extractTokenFromRequest(req);
        const actor = await getCurrentUser(req); 

        if (!actor?.id) {
            const res = NextResponse.json({ user: null }, { status: 200, headers: HEADERS });
            if (rawToken) clearAuthCookies(res);
            return res;
        }
        
        // 🚨 CRITICAL STABILITY FIX: Force Mongoose to register models
        const _registeredModels = [User, Group]; 

        // 1. Find User
        const user = await User.findById(actor.id)
            .select("name email username avatar bio location website createdGroups joinedCommunities")
            .lean();

        if (!user) {
            const res = NextResponse.json({ user: null }, { status: 200, headers: HEADERS });
            clearAuthCookies(res);
            return res;
        }

        // 2. Identify all unique group IDs
        const groupIds = [
            ...(user.createdGroups || []).map(id => id.toString()),
            ...(user.joinedCommunities || []).map(id => id.toString()),
        ];
        
        const uniqueGroupIds = [...new Set(groupIds)].filter(id => 
            id && mongoose.Types.ObjectId.isValid(id)
        );

        let groups = [];
        if (uniqueGroupIds.length > 0) {
            // 3. Fetch group details
            groups = await Group.find({ _id: { $in: uniqueGroupIds } })
                .select("_id name description ownerEmail members category iconUrl bannerUrl slug")
                .lean();
        }

        const groupsMap = groups.reduce((acc, g) => ({ ...acc, [g._id.toString()]: g }), {});

        const transformGroupData = (g, isCreated = false) => ({
            id: g._id.toString(),
            name: g.name,
            description: g.description,
            ownerEmail: g.ownerEmail,
            membersCount: g.members?.length || 0, 
            iconUrl: g.iconUrl || null,
            bannerUrl: g.bannerUrl || null,
            slug: g.slug || null,
            category: g.category,
            createdByCurrentUser: isCreated,
            role: isCreated ? "admin" : "member" 
        });

        // 4. Separate created and explicitly joined groups
        const createdGroupIdsSet = new Set((user.createdGroups || []).map(id => id.toString()));

        const userCreatedGroups = (user.createdGroups || [])
            .map(id => groupsMap[id.toString()])
            .filter(Boolean)
            .map(g => transformGroupData(g, true));

        const userJoinedGroups = (user.joinedCommunities || [])
            .map(id => groupsMap[id.toString()])
            .filter(Boolean)
            .filter(g => !createdGroupIdsSet.has(g._id.toString())) 
            .map(g => transformGroupData(g, false));
        
        const allUserGroups = {
            created: userCreatedGroups,
            joined: userJoinedGroups,
        };

        // 5. Return full payload
        return NextResponse.json(
            { user: buildUserPayload(user, allUserGroups) }, 
            { status: 200, headers: HEADERS }
        );

    } catch (err) {
        console.error("ME ROUTE ERROR (GET):", err);
        return NextResponse.json({ error: "Server error in /api/me" }, { status: 500, headers: HEADERS });
    }
}

/* ===================================================
    PATCH → Update user profile
=================================================== */
export async function PATCH(req) {
    await dbConnect();
    
    try {
        const rawToken = await extractTokenFromRequest(req);
        const actor = await getCurrentUser(req);

        if (!actor?.id) {
            const res = NextResponse.json(
                { error: "Not authenticated" },
                { status: 401, headers: HEADERS }
            );
            if (rawToken) clearAuthCookies(res);
            return res;
        }

        const userId = actor.id;
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

            // Check if username is taken by someone else
            const existing = await User.findOne({
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
            const user = await User.findById(userId).select("-password").lean();
            return NextResponse.json({ user: buildUserPayload(user) }, { status: 200, headers: HEADERS });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();

        if (!updatedUser) {
            const res = NextResponse.json({ error: "User not found" }, { status: 404, headers: HEADERS });
            clearAuthCookies(res);
            return res;
        }

        return NextResponse.json(
            { user: buildUserPayload(updatedUser) },
            { status: 200, headers: HEADERS }
        );

    } catch (err) {
        console.error("ME ROUTE ERROR (PATCH):", err);

        if (err.name === "ValidationError") {
            const msg = Object.values(err.errors).map((e) => e.message).join(", ");
            return NextResponse.json({ error: msg }, { status: 400, headers: HEADERS });
        }

        return NextResponse.json({ error: "Server error updating profile" }, { status: 500, headers: HEADERS });
    }
}