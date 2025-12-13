// src/app/api/groups/[id]/join/route.js

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Group from "@/models/Group";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req, { params }) {
    try {
        await dbConnect();
        const groupId = params.id;

        /* --------------------
            1️⃣ AUTH
        -------------------- */
        const actor = await getCurrentUser(req);
        if (!actor?.id || !actor?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        
        const userId = actor.id;

        /* --------------------
            2️⃣ LOAD USER
        -------------------- */
        const user = await User.findById(userId).select(
            "_id createdGroups joinedCommunities"
        ).lean(); // Use lean() for faster reading

        if (!user) {
            return NextResponse.json(
                { error: "User profile not found in DB" },
                { status: 401 }
            );
        }

        /* --------------------
            3️⃣ UPDATE GROUP (Atomic Add & Count Fix)
        -------------------- */
        
        // Step 3a: Add User ID to members array atomically
        const groupAfterAdd = await Group.findByIdAndUpdate(
            groupId,
            { 
                $addToSet: { members: userId },
            },
            { 
                new: true, // Return the document *after* the update
                select: "members membersCount"
            }
        ).lean();

        if (!groupAfterAdd) {
            return NextResponse.json(
                { error: "Group not found" },
                { status: 404 }
            );
        }

        // Step 3b (CRUCIAL FIX for Real-Time Count): 
        // Synchronize the denormalized membersCount field with the new array length.
        const newMembersCount = groupAfterAdd.members.length;
        
        // This second atomic query ensures the denormalized field is correct.
        await Group.updateOne(
            { _id: groupId },
            { $set: { membersCount: newMembersCount } }
        );
        
        /* --------------------
            4️⃣ UPDATE USER (Atomic Update for Persistence)
        -------------------- */
        // Check if the user is already a creator/member to prevent unnecessary DB operations.
        const isCreator = (user.createdGroups || []).some(id => id.equals(groupAfterAdd._id));
        const isJoined = (user.joinedCommunities || []).some(id => id.equals(groupAfterAdd._id));
        
        if (!isCreator && !isJoined) {
            await User.findByIdAndUpdate(
                userId,
                // $addToSet ensures the group ID is added only once.
                { $addToSet: { joinedCommunities: groupAfterAdd._id } }
            );
        }

        /* --------------------
            5️⃣ RESPONSE
        -------------------- */
        // Return the final, absolute correct count in the response payload
        return NextResponse.json(
            {
                ok: true,
                joined: true,
                groupId: groupAfterAdd._id.toString(),
                membersCount: newMembersCount, // Return the correct count
            },
            { status: 200 }
        );
    } catch (err) {
        console.error("JOIN ROUTE ERROR:", err); 
        return NextResponse.json(
            { error: "Failed to join community" },
            { status: 500 }
        );
    }
}