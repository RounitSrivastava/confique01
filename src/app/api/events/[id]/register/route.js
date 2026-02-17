import dbConnect from "@/lib/mongoose";
import Event from "@/models/Event";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await req.json();

    const {
      userEmail,
      teamMode,
      teamName,
      teamCode,
      formData,
      paidRef
    } = body;

    // Validate Event ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Event ID" }, { status: 400 });
    }

    if (!userEmail) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 });
    }

    // Fetch Event
    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Prevent duplicate registration
    const alreadyRegistered = event.registrations.some(
      r => r.userEmail === userEmail
    );

    if (alreadyRegistered) {
      return NextResponse.json(
        { error: "You are already registered for this event" },
        { status: 400 }
      );
    }

    let assignedTeamCode = null;
    let assignedTeamName = null;
    let membersCount = 1;

    // CREATE TEAM
    if (event.teamConfig?.enabled && teamMode === "create") {

      if (!teamName) {
        return NextResponse.json({ error: "Team name required" }, { status: 400 });
      }

      const generatedCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      event.teams = event.teams || [];

      event.teams.push({
        name: teamName,
        code: generatedCode,
        leader: userEmail,
        members: [userEmail],
        createdAt: new Date()
      });

      assignedTeamCode = generatedCode;
      assignedTeamName = teamName;
      membersCount = 1;
    }

    // JOIN TEAM
    if (event.teamConfig?.enabled && teamMode === "join") {

      const team = event.teams?.find(t => t.code === teamCode);

      if (!team) {
        return NextResponse.json({ error: "Invalid team code" }, { status: 400 });
      }

      if (team.members.includes(userEmail)) {
        return NextResponse.json({ error: "Already in team" }, { status: 400 });
      }

      if (team.members.length >= event.teamConfig.maxMembers) {
        return NextResponse.json({ error: "Team is full" }, { status: 400 });
      }

      team.members.push(userEmail);

      assignedTeamCode = team.code;
      assignedTeamName = team.name;
      membersCount = team.members.length;
    }

    // Save Registration
    event.registrations.push({
      userEmail,
      formData: formData || {},
      paidRef: paidRef || null,
      teamCode: assignedTeamCode,
      teamName: assignedTeamName,
      createdAt: new Date()
    });

    event.registrationsCount += 1;

    await event.save();

    return NextResponse.json({
  success: true,
  message: "Registration successful!",
  registrationsCount: event.registrationsCount,
  registrations: event.registrations,
  teamCode: assignedTeamCode,
  teamName: assignedTeamName,
  membersCount
});


  } catch (err) {
    console.error("❌ Registration API Error:", err);
    return NextResponse.json(
      { error: err.message || "Registration failed" },
      { status: 500 }
    );
  }
}
