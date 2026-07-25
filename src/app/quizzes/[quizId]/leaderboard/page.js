import { dbConnect } from "@/lib/mongoose";
import Quiz from "@/models/Quiz";
import LeaderboardClient from "./LeaderboardClient";

export default async function LeaderboardPage(props) {
  const params = await props.params;
  const quizId = params.quizId;

  let initialQuiz = null;
  let initialSorted = [];

  try {
    await dbConnect();
    const quizDoc = await Quiz.findById(quizId).lean();

    if (quizDoc) {
      const locked = quizDoc.closeAt && Date.now() > new Date(quizDoc.closeAt).getTime();
      
      // Serialize ObjectIds and Dates for passing to Client Component
      initialQuiz = JSON.parse(JSON.stringify({ ...quizDoc, locked }));

      const leaderboard = initialQuiz.leaderboard || [];
      initialSorted = [...leaderboard].map(entry => {
        const p = { ...entry };
        if (p.submittedAt) p.submittedAt = new Date(p.submittedAt).getTime();
        return p;
      }).sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.timeTaken !== b.timeTaken) return a.timeTaken - b.timeTaken;
        return (a.submittedAt || 0) - (b.submittedAt || 0);
      });
    }
  } catch (err) {
    console.error("Failed to load initial quiz for leaderboard", err);
  }

  return <LeaderboardClient initialQuiz={initialQuiz} initialSorted={initialSorted} />;
}
