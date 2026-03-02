import { dbConnect } from "@/lib/mongoose";
import Event from "@/models/Event";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  await dbConnect();

  const { teamCode, email, requester } = await req.json();

  const event = await Event.findById(params.id);
  if (!event) {
    return NextResponse.json(
      { error: "Event not found" },
      { status: 404 }
    );
  }

  const teamIndex = event.teams.findIndex(t => t.code === teamCode);
  if (teamIndex === -1) {
    return NextResponse.json(
      { error: "Team not found" },
      { status: 404 }
    );
  }

  const team = event.teams[teamIndex];

  // 🔥 IMPORTANT: Use leader instead of creator
  const isCreator =
    String(team.leader).toLowerCase() ===
    String(requester).toLowerCase();

  const isSelf =
    String(requester).toLowerCase() ===
    String(email).toLowerCase();

  // 🚫 Block unauthorized removal
  if (!isCreator && !isSelf) {
    return NextResponse.json(
      { error: "Not authorized to remove this member" },
      { status: 403 }
    );
  }

  // Remove member
  team.members = team.members.filter(m => m !== email);

  // 🗑 If no members left → delete team
  if (team.members.length === 0) {
    event.teams.splice(teamIndex, 1);
    await event.save();

    return NextResponse.json({
      success: true,
      teamDeleted: true,
    });
  }

  // 🔄 If leader left → transfer leadership
  if (String(team.leader).toLowerCase() === String(email).toLowerCase()) {
    team.leader = team.members[0]; // first remaining member becomes new leader
  }

  await event.save();

  return NextResponse.json({
    success: true,
    newCreator: team.leader, // frontend still expects newCreator
  });
}