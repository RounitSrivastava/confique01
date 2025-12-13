import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongoose";
import User from "@/models/User"; 
import Group from "@/models/Group"; // Import the Group model
import { getCurrentUser, extractTokenFromRequest } from "@/lib/auth";
import mongoose from "mongoose";

/* ===================================================
    CONSTANTS
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
    const safeUsername =
        normalizeUsername(u.username) || normalizeUsername(name) || deriveUsernameFromEmail(email);

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
        // ADDED: Group data arrays
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
    try {
        const rawToken = await extractTokenFromRequest(req);
        const actor = await getCurrentUser(req); // {id, email} or null

        if (!actor?.id) {
            const res = NextResponse.json({ user: null }, { status: 200, headers: HEADERS });
            if (rawToken) clearAuthCookies(res);
            return res;
        }
        
        await connectToDatabase();
        
        // 🚨 CRITICAL STABILITY FIX: Force Mongoose to register models
        // eslint-disable-next-line no-unused-vars
        const [_, __] = [User, Group]; 

        // 1. Find User, selecting necessary fields including group references
        const user = await User.findById(actor.id)
            .select("name email username avatar bio location website createdGroups joinedCommunities")
            .lean();

        if (!user) {
            const res = NextResponse.json({ user: null }, { status: 200, headers: HEADERS });
            clearAuthCookies(res);
            return res;
        }

        // 2. Identify all unique group IDs related to the user
        const groupIds = [
            ...(user.createdGroups || []).map(id => id.toString()),
            ...(user.joinedCommunities || []).map(id => id.toString()),
        ];
        
        const uniqueGroupIds = [...new Set(groupIds)].filter(id => id.length > 0 && mongoose.Types.ObjectId.isValid(id));

        let groups = [];
        if (uniqueGroupIds.length > 0) {
            // 3. Fetch all group details from the database
            groups = await Group.find({ _id: { $in: uniqueGroupIds } })
                // Select necessary group fields
                .select("_id name description ownerEmail members category iconUrl bannerUrl slug")
                .lean();
        }

        const groupsMap = groups.reduce((acc, g) => ({ ...acc, [g._id.toString()]: g }), {});

        const transformGroupData = (g, isCreated = false) => ({
            id: g._id.toString(),
            name: g.name,
            description: g.description,
            ownerEmail: g.ownerEmail,
            // Use the consistent 'members' array for count
            membersCount: g.members?.length || 0, 
            iconUrl: g.iconUrl || null,
            bannerUrl: g.bannerUrl || null,
            slug: g.slug || null,
            category: g.category,
            createdByCurrentUser: isCreated,
            role: isCreated ? "admin" : "member" 
        });

        // 4. Separate created and explicitly joined groups
        const createdGroupIds = new Set((user.createdGroups || []).map(id => id.toString()));

        const userCreatedGroups = (user.createdGroups || [])
            .map(id => groupsMap[id.toString()])
            .filter(Boolean)
            .map(g => transformGroupData(g, true));

        // Filter joined communities to exclude the ones the user created
        const userJoinedGroups = (user.joinedCommunities || [])
            .map(id => groupsMap[id.toString()])
            .filter(Boolean)
            .filter(g => !createdGroupIds.has(g._id.toString())) 
            .map(g => transformGroupData(g, false));
        
        const allUserGroups = {
            created: userCreatedGroups,
            joined: userJoinedGroups,
        };

        // 5. Return the full payload
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
    try {
        const rawToken = await extractTokenFromRequest(req);
        const actor = await getCurrentUser(req);

        // 1) AUTH CHECK
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

        // 2) USERNAME VALIDATION
        if (typeof username === "string") {
            const norm = normalizeUsername(username);
            if (!norm) {
                return NextResponse.json({ error: "Invalid username" }, { status: 400, headers: HEADERS });
            }

            await connectToDatabase();
            
            // 🚨 CRITICAL STABILITY FIX: Force Mongoose to register models
            // eslint-disable-next-line no-unused-vars
            const [_, __] = [User, Group]; 
            
            const existing = await User.findOne({
                username: { $regex: `^${norm}$`, $options: "i" },
            })
                .select("_id")
                .lean();

            if (existing && existing._id.toString() !== userId) {
                return NextResponse.json(
                    { error: "Username already taken" },
                    { status: 409, headers: HEADERS }
                );
            }

            updateData.username = norm;
        }

        // 3) EMPTY UPDATE HANDLING
        if (Object.keys(updateData).length === 0) {
            // If no update fields are present, just return the current user data 
            await connectToDatabase();
            const user = await User.findById(userId)
                .select("name email username avatar bio location website") // Basic profile fields
                .lean();
            if (user) {
                // Return payload without group data as no updates were made
                return NextResponse.json({ user: buildUserPayload(user) }, { status: 200, headers: HEADERS });
            }
        }

        // 4) APPLY UPDATE
        await connectToDatabase();
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        )
            .select("name email username avatar bio location website")
            .lean();

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

        // Mongoose validation errors
        if (err.name === "ValidationError") {
            const msg = Object.values(err.errors).map((e) => e.message).join(", ");
            return NextResponse.json(
                { error: msg || "Validation failed." },
                { status: 400, headers: HEADERS }
            );
        }

        return NextResponse.json(
            { error: "Server error updating profile" },
            { status: 500, headers: HEADERS }
        );
    }
}