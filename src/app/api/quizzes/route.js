import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongoose";
import Quiz from "@/models/Quiz";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

/* ===================================================
   GET ALL QUIZZES
=================================================== */

export async function GET() {
  try {
    await dbConnect();

    const actor = await getCurrentUser();
    const rawUserId = actor?.id || actor?.userId;

    let currentUser = null;

    // 🔥 Find real Mongo user
    if (rawUserId) {
      if (mongoose.Types.ObjectId.isValid(rawUserId)) {
        currentUser = await User.findById(rawUserId);
      }

      if (!currentUser) {
        currentUser = await User.findOne({
          $or: [
            { googleId: rawUserId },
            { email: actor?.email },
          ],
        });
      }
    }

    const currentUserId = currentUser?._id?.toString() || null;

    const quizzes = await Quiz.find()
      .sort({ createdAt: -1 })
      .lean();

    const updatedQuizzes = quizzes.map((quiz) => {
      const createdBy = quiz.createdBy
        ? quiz.createdBy.toString()
        : null;

      let hasAttempted = false;

      if (currentUserId && Array.isArray(quiz.leaderboard)) {
        hasAttempted = quiz.leaderboard.some((entry) => {
          if (!entry.userId) return false;
          return entry.userId.toString() === currentUserId;
        });
      }

      return {
  ...quiz,
  createdBy,
  hasAttempted,
  startAt: quiz.startAt ? new Date(quiz.startAt).toISOString() : null,
  closeAt: quiz.closeAt ? new Date(quiz.closeAt).toISOString() : null,
};
    });

    return NextResponse.json(updatedQuizzes);

  } catch (err) {
    console.error("GET QUIZZES ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

/* ===================================================
   CREATE QUIZ
=================================================== */

export async function POST(req) {
  try {
    await dbConnect();

    const actor = await getCurrentUser();
    const rawUserId = actor?.id || actor?.userId;

    if (!rawUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 🔥 Find real Mongo user document
    let user = null;

    if (mongoose.Types.ObjectId.isValid(rawUserId)) {
      user = await User.findById(rawUserId);
    }

    if (!user) {
      user = await User.findOne({
        $or: [
          { googleId: rawUserId },
          { email: actor?.email },
        ],
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    const body = await req.json();

    if (
      !body.title ||
      !Array.isArray(body.questions) ||
      body.questions.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid quiz data" },
        { status: 400 }
      );
    }

    const quiz = await Quiz.create({
      ...body,
      createdBy: user._id, // ✅ Correct ObjectId
    });

    return NextResponse.json(
      {
        ...quiz.toObject(),
        createdBy: quiz.createdBy.toString(),
      },
      { status: 201 }
    );

  } catch (err) {
    console.error("CREATE QUIZ ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}