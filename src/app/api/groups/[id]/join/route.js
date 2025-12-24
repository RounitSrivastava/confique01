import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";
import Group from "@/models/Group";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req, context) {
  await dbConnect();

  try {
    // ✅ Correct params access
    const { id: groupId } = context.params;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json(
        { error: "Invalid group ID" },
        { status: 400 }
      );
    }

    // ✅ Correct auth usage (NO req)
    const actor = await getCurrentUser();
    if (!actor?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to join." },
        { status: 401 }
      );
    }

    const userId = actor.id;

    /* --------------------
       UPDATE GROUP
    -------------------- */
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: userId } },
      { new: true, select: "members" }
    ).lean();

    if (!updatedGroup) {
      return NextResponse.json(
        { error: "Community not found" },
        { status: 404 }
      );
    }

    const newMembersCount = updatedGroup.members.length;

    await Group.updateOne(
      { _id: groupId },
      { $set: { membersCount: newMembersCount } }
    );

    /* --------------------
       UPDATE USER
    -------------------- */
    await User.findByIdAndUpdate(userId, {
      $addToSet: { joinedCommunities: groupId },
    });

    return NextResponse.json(
      {
        ok: true,
        joined: true,
        groupId,
        membersCount: newMembersCount,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("JOIN ROUTE ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error while joining." },
      { status: 500 }
    );
  }
}
