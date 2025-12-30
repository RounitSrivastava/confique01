import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Group from "@/models/Group";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ==========================================
    GET → Fetch all groups + user state
========================================== */
export async function GET() {
  await dbConnect();

  try {
    const actor = await getCurrentUser();

    let joinedGroupIds = [];
    let createdGroupIds = [];

    if (actor?.id) {
      const user = await User.findById(actor.id)
        .select("joinedCommunities createdGroups")
        .lean();

      if (user) {
        joinedGroupIds = (user.joinedCommunities || []).map(String);
        createdGroupIds = (user.createdGroups || []).map(String);
      }
    }

    const groups = await Group.find().lean();

    const responseGroups = groups.map((g) => ({
      ...g,
      id: g._id.toString(),
      membersCount: g.members?.length || 0,
      members: undefined,
    }));

    return NextResponse.json({
      groups: responseGroups,
      joinedGroupIds,
      createdGroupIds,
    });
  } catch (error) {
    console.error("GET ALL GROUPS ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}

/* ==========================================
    POST → Create a new group (VERCEL SAFE)
========================================== */
export async function POST(req) {
  await dbConnect();

  try {
    const actor = await getCurrentUser();

    if (!actor?.id || !actor?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 🔥 URLs only (uploaded from frontend)
    const body = await req.json();
    const { name, description, category, iconUrl, bannerUrl } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Group name required" },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");

    const group = await Group.create({
      name,
      description,
      slug,
      category,
      ownerEmail: actor.email.toLowerCase(),
      iconUrl: iconUrl || null,
      bannerUrl: bannerUrl || null,
      members: [actor.id],
      membersCount: 1,
    });

    await User.findByIdAndUpdate(actor.id, {
      $addToSet: {
        createdGroups: group._id,
        joinedCommunities: group._id,
      },
    });

    const groupResponse = group.toObject();
    groupResponse.id = group._id.toString();
    groupResponse.members = undefined;

    return NextResponse.json(
      { group: groupResponse },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST CREATE GROUP ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error creating group" },
      { status: 500 }
    );
  }
}
