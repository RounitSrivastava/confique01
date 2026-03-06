"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft } from "lucide-react";

export default function QuizPlay() {
  const { quizId } = useParams();
  const router = useRouter();

  const [quiz, setQuiz] = useState(null);
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState({});
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionTimes, setQuestionTimes] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attemptTime, setAttemptTime] = useState(0);
  const [attemptLimit, setAttemptLimit] = useState(null);

  const startTimeRef = useRef(Date.now()).current;

  /* ---------------- FETCH USER ---------------- */

  useEffect(() => {
    const loadUser = async () => {
      const res = await fetch("/api/me", { cache: "no-store" });
      const data = await res.json();

      if (!data?.user) {
        router.push("/login");
        return;
      }

      setUser(data.user);
    };

    loadUser();
  }, []);

  /* ---------------- FETCH QUIZ ---------------- */

  useEffect(() => {
    if (!user) return;

    const loadQuiz = async () => {
      try {
        const res = await fetch(`/api/quizzes/${quizId}`, {
          cache: "no-store",
        });

        if (!res.ok) {
  console.error("Quiz fetch failed");
  return;
}

const data = await res.json();

        const now = new Date();

        // 🔒 Quiz not started yet
        if (data.startAt && now < new Date(data.startAt)){
          alert("Quiz has not started yet.");
          router.push("/quizzes");
          return;
        }

        // 🔒 Quiz closed
        if (data.closeAt && now > new Date(data.closeAt)){
          alert("Quiz already ended.");
          router.push(`/quizzes/${quizId}/leaderboard`);
          return;
        }

        // 🔒 Prevent reattempt
        const alreadyAttempted = data.leaderboard?.find(
          (p) => p.userName === user.username
        );

        if (alreadyAttempted) {
          alert("You have already attempted this quiz.");
          router.push(`/quizzes/${quizId}/leaderboard`);
          return;
        }

        setQuiz(data);
        setAttemptLimit((data.attemptTime || 20) * 60);

        // ✅ Schedule-based timer
       if (data.closeAt) {
  const closeTime = new Date(data.closeAt);
  const remainingSeconds = Math.floor(
    (closeTime.getTime() - now.getTime()) / 1000
  );

  setTimeLeft(Math.max(remainingSeconds, 0));
} else {
  setTimeLeft(null);
}

      } catch (err) {
        console.error("Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [user, quizId]);

  /* ---------------- TIMER ---------------- */

  useEffect(() => {
    if (!quiz || submitted || timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
  setTimeLeft((prev) => (prev ? prev - 1 : 0));
}, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quiz, submitted]);

 /* ---------------- ATTEMPT TIMER ---------------- */

useEffect(() => {
  if (submitted || attemptLimit === null) return;

  const interval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTimeRef) / 1000);

    if (elapsed >= attemptLimit) {
      handleSubmit();
      clearInterval(interval);
      return;
    }

    setAttemptTime(Math.min(elapsed, attemptLimit));
  }, 1000);

  return () => clearInterval(interval);
}, [submitted, attemptLimit]);

  /* ---------------- LOCK SCROLL ---------------- */

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  if (loading || !quiz || attemptLimit === null){
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0b1d3a] text-white">
        Loading...
      </div>
    );
  }

  const totalQuestions = quiz.questions.length;
  const question = quiz.questions[currentQuestion];

  /* ---------------- SELECT ANSWER ---------------- */

  const handleSelect = (oIndex) => {
    if (submitted) return;

    const timeSpent = Math.floor(
      (Date.now() - questionStartTime) / 1000
    );

    setQuestionTimes((prev) => ({
      ...prev,
      [currentQuestion]: timeSpent,
    }));

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: oIndex,
    }));
  };

  /* ---------------- NAVIGATION ---------------- */

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      setQuestionStartTime(Date.now());
    }
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);
    setTimeLeft(null);
    

    let totalScore = 0;

    quiz.questions.forEach((q, qIndex) => {
  const correctIndex = q.options.findIndex((o) => o.isCorrect);
  const userAnswer = answers[qIndex];

  let timeSpent = questionTimes[qIndex];

  // calculate time for current question if not stored yet
  if (qIndex === currentQuestion) {
    timeSpent = Math.floor(
      (Date.now() - questionStartTime) / 1000
    );
  }

  if (timeSpent === undefined) timeSpent = 999;

  if (userAnswer === correctIndex) {
    totalScore += q.points;
    if (timeSpent <= 5) totalScore += 2;
  } else if (userAnswer !== undefined) {
    totalScore -= q.points * 0.25;
  }
});

    if (totalScore < 0) totalScore = 0;

    const totalTimeTaken = Math.floor(
      (Date.now() - startTimeRef) / 1000
    );

    try {
      await fetch(`/api/quizzes/${quizId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: totalScore,
          timeTaken: totalTimeTaken,
          startedAt: startTimeRef,
        }),
      });

      router.push(`/quizzes/${quizId}/leaderboard`);
    } catch (err) {
      console.error("Submit failed");
    }
  };

  /* ---------------- FORMAT TIME ---------------- */

  const formatTime = (seconds) => {
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  } else {
    return `${seconds}s`;
  }
};

  /* ---------------- UI ---------------- */

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-[#0b1d3a] via-[#142850] to-[#0b1d3a] text-white overflow-y-auto">

      <button
        onClick={() => router.push("/quizzes")}
        className="absolute top-4 left-4 flex items-center gap-1 text-blue-200 hover:text-white transition"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl bg-[#132043] rounded-3xl p-8 border border-blue-400/30 shadow-xl">

          <h1 className="text-3xl font-bold text-center text-blue-300 mb-6">
            {quiz.title}
          </h1>

          <div className="flex justify-between mb-6 text-blue-200">
            <div>
              Question {currentQuestion + 1} / {totalQuestions}
            </div>
            <div className="text-blue-200">
 ⏱ {formatTime(Math.max(attemptLimit - attemptTime, 0))}
</div>
          </div>

          <h3 className="mb-6 text-xl">
            {question.question}
          </h3>

          <div className="space-y-4">
            {question.options.map((o, oIndex) => (
              <div
                key={oIndex}
                onClick={() => handleSelect(oIndex)}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  answers[currentQuestion] === oIndex
                    ? "border-blue-400 bg-blue-600/30"
                    : "border-blue-400/20 hover:bg-blue-500/10"
                }`}
              >
                {o.text}
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrev}
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-gray-600 rounded-xl disabled:opacity-40"
            >
              Previous
            </button>

            {currentQuestion === totalQuestions - 1 ? (
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-green-600 rounded-xl"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 rounded-xl"
              >
                Next
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}