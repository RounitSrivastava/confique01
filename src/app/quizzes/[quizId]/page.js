import { dbConnect } from "@/lib/mongoose";
import Quiz from "@/models/Quiz";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/auth";
import QuizPlayClient from "./QuizPlayClient";
import { redirect } from "next/navigation";

// Force HMR Rebuild

export default async function QuizPlayPage(props) {
  const params = await props.params;
  const quizId = params.quizId;

  let initialQuiz = null;
  let initialUser = null;

  try {
    await dbConnect();
    
    // 1. Fetch User
    const actor = await getCurrentUser();
    const rawUserId = actor?.id || actor?.userId;
    
    if (!rawUserId) {
      redirect("/auth/login");
    }

    let userDoc = null;
    if (rawUserId.match(/^[0-9a-fA-F]{24}$/)) {
      userDoc = await User.findById(rawUserId).lean();
    }
    if (!userDoc) {
      userDoc = await User.findOne({
        $or: [{ googleId: rawUserId }, { email: actor?.email }]
      }).lean();
    }

    if (userDoc) {
      initialUser = {
        id: userDoc._id.toString(),
        username: userDoc.username || userDoc.name || userDoc.fullName || (userDoc.email ? userDoc.email.split("@")[0] : ""),
      };
    } else {
      redirect("/auth/login");
    }

    // 2. Fetch Quiz
    const quizDoc = await Quiz.findById(quizId).lean();

    if (quizDoc) {
      quizDoc._id = quizDoc._id.toString();
      if (quizDoc.createdBy) quizDoc.createdBy = quizDoc.createdBy.toString();
      if (quizDoc.groupId) quizDoc.groupId = quizDoc.groupId.toString();
      
      if (quizDoc.startAt) quizDoc.startAt = new Date(quizDoc.startAt).toISOString();
      if (quizDoc.closeAt) quizDoc.closeAt = new Date(quizDoc.closeAt).toISOString();
      if (quizDoc.createdAt) quizDoc.createdAt = new Date(quizDoc.createdAt).toISOString();
      if (quizDoc.updatedAt) quizDoc.updatedAt = new Date(quizDoc.updatedAt).toISOString();
      
      const leaderboard = quizDoc.leaderboard || [];
      quizDoc.leaderboard = leaderboard.map(entry => {
        const p = { ...entry };
        if (p._id) p._id = p._id.toString();
        if (p.userId) p.userId = p.userId.toString();
        if (p.submittedAt) p.submittedAt = new Date(p.submittedAt).getTime();
        return p;
      });

      initialQuiz = quizDoc;
    }
  } catch (err) {
    console.error("Failed to load initial quiz for play page", err);
  }

  return <QuizPlayClient initialQuiz={initialQuiz} initialUser={initialUser} />;
}
