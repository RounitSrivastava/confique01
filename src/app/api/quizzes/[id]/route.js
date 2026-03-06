import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongoose";
import Quiz from "@/models/Quiz";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

/* ===================================================
   GET SINGLE QUIZ
=================================================== */

export async function GET(req, context) {
  try {
    await dbConnect();

    const { id } = await context.params; // ✅ FIXED

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid quiz ID" },
        { status: 400 }
      );
    }

    const quiz = await Quiz.findById(id).lean();

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(quiz);

  } catch (err) {
    console.error("GET QUIZ ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

/* ===================================================
   SUBMIT QUIZ ATTEMPT (NO DUPLICATES)
=================================================== */

export async function PATCH(req, context) {
  try {
    await dbConnect();

    const { id } = await context.params; // ✅ FIXED

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid quiz ID" },
        { status: 400 }
      );
    }

    const actor = await getCurrentUser();
    const rawUserId = actor?.id || actor?.userId;

    if (!rawUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { score, timeTaken } = body;

    if (
      typeof score !== "number" ||
      typeof timeTaken !== "number" ||
      score < 0 ||
      timeTaken < 0
    ) {
      return NextResponse.json(
        { error: "Invalid submission data" },
        { status: 400 }
      );
    }

    /* 🔥 Find real Mongo user */
    let user = null;

    if (mongoose.Types.ObjectId.isValid(rawUserId)) {
      user = await User.findById(rawUserId);
    }

    if (!user) {
      user = await User.findOne({
        $or: [
          { googleId: rawUserId },
          { email: actor?.email }
        ]
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userName =
      user.username ||
      user.name ||
      user.fullName ||
      (user.email ? user.email.split("@")[0] : null);

    if (!userName) {
      return NextResponse.json(
        { error: "User name missing" },
        { status: 400 }
      );
    }

    /* 🔥 IMPORTANT FIX:
       Check start/close BEFORE pushing to leaderboard
    */

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    if (quiz.startAt && new Date() < quiz.startAt) {
      return NextResponse.json(
        { error: "Quiz not started yet" },
        { status: 403 }
      );
    }

    if (quiz.closeAt && new Date() > quiz.closeAt) {
      return NextResponse.json(
        { error: "Quiz already closed" },
        { status: 403 }
      );
    }
    // 🔒 Prevent submission after attempt time
// 🔒 Prevent very late submissions (allow 5 second buffer)
if (quiz.attemptTime && body.startedAt) {
  const startTime = new Date(body.startedAt).getTime();
  const attemptEnd = startTime + quiz.attemptTime * 60 * 1000;

  // allow 5 second delay for auto-submit
  if (Date.now() > attemptEnd + 5000) {
    return NextResponse.json(
      { error: "Attempt time expired" },
      { status: 403 }
    );
  }
}

    /* Prevent double attempt */
    const alreadyAttempted = quiz.leaderboard.some(
      (entry) => entry.userId.toString() === user._id.toString()
    );

    if (alreadyAttempted) {
      return NextResponse.json(
        { error: "You have already attempted this quiz" },
        { status: 409 }
      );
    }

    quiz.leaderboard.push({
      userId: user._id,
      userName: String(userName),
      score,
      timeTaken,
      submittedAt: new Date(),
    });

    await quiz.save();

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("PATCH ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

/* ===================================================
   DELETE QUIZ
=================================================== */

export async function DELETE(req, context) {
  try {
    await dbConnect();

    const { id } = await context.params; // ✅ FIXED

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid quiz ID" },
        { status: 400 }
      );
    }

    const actor = await getCurrentUser();
    const rawUserId = actor?.id || actor?.userId;

    if (!rawUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    if (quiz.createdBy.toString() !== rawUserId.toString()) {
      return NextResponse.json(
        { error: "Forbidden: Not quiz creator" },
        { status: 403 }
      );
    }

    await quiz.deleteOne();

    return NextResponse.json(
      { message: "Quiz deleted successfully" },
      { status: 200 }
    );

  } catch (err) {
    console.error("DELETE ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}