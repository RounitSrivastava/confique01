import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Group from "@/models/Group";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ======================================================
   Helper → Normalize Category (SINGLE SOURCE OF TRUTH)
====================================================== */
const normalizeCategory = (category) => {
  return (category || "For You")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());
};

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
        joinedGroupIds = (user.joinedCommunities || []).map((id) =>
          id.toString()
        );
        createdGroupIds = (user.createdGroups || []).map((id) =>
          id.toString()
        );
      }
    }

    const groups = await Group.find()
      .sort({ membersCount: -1 })
      .lean();

    // ✅ Normalize category on READ (critical)
    const responseGroups = groups.map((g) => ({
      ...g,
      id: g._id.toString(),
      category: normalizeCategory(g.category),
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
   POST → Create a new group
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

    const body = await req.json();
    const { name, description, category, iconBase64, bannerBase64 } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Group name required" },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().trim().replace(/\s+/g, "-");

    // ✅ Normalize category BEFORE saving
    const normalizedCategory = normalizeCategory(category);

    let iconUrl = null;
    let bannerUrl = null;
    let iconPublicId = null;
    let bannerPublicId = null;

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

    const group = await Group.create({
      name: name.trim(),
      description: description?.trim() || "",
      slug,
      category: normalizedCategory, // ✅ FIX
      ownerEmail: actor.email.toLowerCase(),
      iconUrl,
      iconPublicId,
      bannerUrl,
      bannerPublicId,
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
    groupResponse.category = normalizedCategory;
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
