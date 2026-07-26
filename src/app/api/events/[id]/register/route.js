import dbConnect from "@/lib/mongoose";
import Event from "@/models/Event";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req, context) {
  try {
    await dbConnect();

    const { id } = context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid Event ID" },
        { status: 400 }
      );
    }

    const formData = await req.formData();

    const userEmail = formData.get("userEmail");
    const teamMode = formData.get("teamMode");
    const teamName = formData.get("teamName");
    const teamCode = formData.get("teamCode");
    const paidRef = formData.get("paidRef");
    const paymentMethod = formData.get("paymentMethod") || "qr";
    const paidAmount = Number(formData.get("paidAmount") || 0);
    const ticketSelectionRaw = formData.get("ticketSelection");

let ticketSelection = [];

if (ticketSelectionRaw) {
  const parsed = JSON.parse(ticketSelectionRaw);

  if (Array.isArray(parsed)) {
    ticketSelection = parsed.filter(
      (t) =>
        t &&
        t.type &&
        t.price &&
        t.quantity &&
        t.subtotal
    );
  }
}

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // 🔁 Prevent duplicate registration
    const alreadyRegistered = event.registrations.some(
      (r) => r.userEmail === userEmail
    );

    if (alreadyRegistered) {
      return NextResponse.json({
        success: true,
        alreadyRegistered: true,
      });
    }

    // ====================================================
    // 🔥 HANDLE ALL FILE FIELDS (Dynamic + Screenshot)
    // ====================================================
    let screenshotUrl = null;
    const dynamicFormData = {};

    for (const [key, value] of formData.entries()) {

      // Skip system keys
      if (
        [
          "userEmail",
          "teamMode",
          "teamName",
          "teamCode",
          "paidRef",
          "paidAmount",
          "paymentMethod",
          "ticketSelection" 
        ].includes(key)
      ) continue;

      // If file → upload to Cloudinary
      if (value instanceof File) {

        const bytes = await value.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { folder: "event_uploads" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            )
            .end(buffer);
        });

        dynamicFormData[key] = uploadResult.secure_url;

        // Special handling for payment screenshot
        if (key === "paymentScreenshot") {
          screenshotUrl = uploadResult.secure_url;
        }

      } else {
        dynamicFormData[key] = value;
      }
    }

    // ====================================================
    // 🔐 QR PAYMENT VALIDATION
    // ====================================================
    if (!event.isFree && paymentMethod === "qr") {

      if (!paidRef || paidRef.length !== 4) {
        return NextResponse.json(
          { error: "Valid 4-digit payment reference required" },
          { status: 400 }
        );
      }

      if (!screenshotUrl) {
        return NextResponse.json(
          { error: "Payment screenshot required" },
          { status: 400 }
        );
      }
    }

    let assignedTeamCode = null;
    let assignedTeamName = null;
    let membersCount = 1;

    // ====================================================
    // 👥 TEAM CREATION
    // ====================================================
    if (event.teamConfig?.enabled && teamMode === "create") {

      if (!teamName) {
        return NextResponse.json(
          { error: "Team name required" },
          { status: 400 }
        );
      }

      event.teams = event.teams || [];

      let generatedCode;
      let codeExists = true;

      while (codeExists) {
        generatedCode = Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();

        codeExists = event.teams.some(
          (t) => t.code === generatedCode
        );
      }

      event.teams.push({
        name: teamName,
        code: generatedCode,
        leader: userEmail,
        members: [userEmail],
        createdAt: new Date(),
      });

      assignedTeamCode = generatedCode;
      assignedTeamName = teamName;
      membersCount = 1;
    }

    // ====================================================
    // 👥 TEAM JOIN
    // ====================================================
    if (event.teamConfig?.enabled && teamMode === "join") {

      const team = event.teams?.find(
        (t) => t.code === teamCode
      );

      if (!team) {
        return NextResponse.json(
          { error: "Invalid team code" },
          { status: 400 }
        );
      }

      if (team.members.includes(userEmail)) {
        return NextResponse.json(
          { error: "Already in team" },
          { status: 400 }
        );
      }

      if (
        team.members.length >=
        event.teamConfig.maxMembers
      ) {
        return NextResponse.json(
          { error: "Team is full" },
          { status: 400 }
        );
      }

      team.members.push(userEmail);

      assignedTeamCode = team.code;
      assignedTeamName = team.name;
      membersCount = team.members.length;
    }

    // ====================================================
    // ✅ SAVE REGISTRATION
    // ====================================================
    event.registrations.push({
      userEmail,
      formData: dynamicFormData,
      ticketSelection, 
      paidRef: paymentMethod === "qr" ? paidRef || null : null,
      paymentMethod,
      paidAmount,
      screenshotUrl,
      teamCode: assignedTeamCode,
      teamName: assignedTeamName,
      createdAt: new Date(),
    });

    event.registrationsCount = event.registrations.length;

    await event.save();

    // ====================================================
    // 🔔 DISPATCH NOTIFICATIONS
    // ====================================================
    try {
      // 1. Notify the registering user
      await Notification.create({
        targetEmail: userEmail.toLowerCase(),
        type: "EVENT_REGISTRATION",
        message: `You have successfully registered for ${event.title}.`,
        postId: id,
      });

      // 2. Try to notify the host (by looking up the user whose name matches event.hostedBy)
      if (event.hostedBy) {
        const hostUser = await User.findOne({ 
          $or: [
            { name: event.hostedBy },
            { username: event.hostedBy },
            { email: event.hostedBy }
          ]
        }).lean();
        
        if (hostUser && hostUser.email && hostUser.email.toLowerCase() !== userEmail.toLowerCase()) {
          await Notification.create({
            targetEmail: hostUser.email.toLowerCase(),
            type: "NEW_REGISTRATION",
            message: `New registration for your event: ${event.title}.`,
            postId: id,
          });
        }
      }
    } catch (notifErr) {
      console.error("⚠️ Failed to dispatch registration notifications:", notifErr);
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful!",
      teamCode: assignedTeamCode,
      membersCount,
    });

  } catch (err) {

    console.error("❌ Registration API Error:", err);

    return NextResponse.json(
      { error: err.message || "Registration failed" },
      { status: 500 }
    );
  }
}