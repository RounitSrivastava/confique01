"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft } from "lucide-react";

export default function QuizPlayClient({ initialQuiz, initialUser }) {
  const { quizId } = useParams();
  const router = useRouter();

  const [quiz, setQuiz] = useState(initialQuiz);
  const [user, setUser] = useState(initialUser);
  const [answers, setAnswers] = useState({});
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionTimes, setQuestionTimes] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attemptTime, setAttemptTime] = useState(0);
  const [attemptLimit, setAttemptLimit] = useState(initialQuiz ? (initialQuiz.attemptTime ? initialQuiz.attemptTime * 60 : null) : undefined);

  const startTimeRef = useRef(Date.now()).current;

  /* ---------------- SETUP QUIZ ---------------- */

  useEffect(() => {
    if (!user || !quiz) {
      if (!user) router.push("/login");
      return;
    }

    const now = new Date();

    // 🔒 Quiz not started yet
    if (quiz.startAt && now < new Date(quiz.startAt)){
      alert("Quiz has not started yet.");
      router.replace("/quizzes");
      return;
    }

    // 🔒 Quiz closed
    if (quiz.closeAt && now > new Date(quiz.closeAt)){
      alert("Quiz already ended.");
      router.replace(`/quizzes/${quizId}/leaderboard`);
      return;
    }

    // 🔒 Prevent reattempt
    const alreadyAttempted = quiz.leaderboard?.find(
      (p) => p.userName === user.username
    );

    if (alreadyAttempted) {
      alert("You have already attempted this quiz.");
      router.replace(`/quizzes/${quizId}/leaderboard`);
      return;
    }

    // ✅ Schedule-based timer
    if (quiz.closeAt) {
      const closeTime = new Date(quiz.closeAt);
      const remainingSeconds = Math.floor(
        (closeTime.getTime() - now.getTime()) / 1000
      );
      setTimeLeft(Math.max(remainingSeconds, 0));
    } else {
      setTimeLeft(null);
    }
  }, []);

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

  if (loading || !quiz || attemptLimit === undefined){
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#f8f9fc] dark:bg-gradient-to-br dark:from-[#0b1d3a] dark:via-[#142850] dark:to-[#0b1d3a] z-[9999]">
        <div className="w-12 h-12 border-4 border-purple-500 dark:border-blue-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(139,92,246,0.3)] dark:shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
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
    if (submitted || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitted(true);
    setTimeLeft(null);
    

    // freeze answers & times so React state delay doesn't affect scoring
const finalAnswers = { ...answers };

const finalQuestionTimes = {
  ...questionTimes,
  [currentQuestion]: Math.floor(
    (Date.now() - questionStartTime) / 1000
  ),
};

let totalScore = 0;

quiz.questions.forEach((q, qIndex) => {
  const correctIndex = q.options.findIndex((o) => o.isCorrect);
  const userAnswer = finalAnswers[qIndex];

  const timeSpent = finalQuestionTimes[qIndex] ?? 999;

  if (userAnswer === correctIndex) {
    totalScore += Number(q.points);
    if (timeSpent <= 5) totalScore += 2;
  } else if (userAnswer !== undefined) {
    totalScore -= Number(q.points) * 0.25;
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
      setIsSubmitting(false);
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
    <div className="fixed inset-0 z-[9999] bg-[#f8f9fc] dark:bg-gradient-to-br dark:from-[#0b1d3a] dark:via-[#142850] dark:to-[#0b1d3a] text-gray-900 dark:text-text-1 overflow-y-auto font-sans">

      <button
        onClick={() => router.push("/quizzes")}
        className="absolute top-6 left-6 flex items-center gap-2 font-medium text-gray-500 hover:text-gray-900 dark:text-blue-200 dark:hover:text-text-1 transition-all"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-10">
        <div className="w-full max-w-3xl bg-white dark:bg-[#1a2c4e] rounded-[2rem] p-8 lg:p-10 border border-gray-200 dark:border-[#a22df6]/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl">

          <h1 className="text-3xl font-black text-center text-gray-900 dark:text-white mb-8 tracking-tight">
            {quiz.title}
          </h1>

          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100 dark:border-[#a22df6]/20 text-gray-500 dark:text-gray-300 font-semibold text-sm">
            <div className="uppercase tracking-wider">
              Question {currentQuestion + 1} / {totalQuestions}
            </div>
            {attemptLimit !== null && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                ⏱ {formatTime(Math.max(attemptLimit - attemptTime, 0))}
              </div>
            )}
          </div>

          <h3 className="mb-8 text-[1.35rem] font-bold text-gray-800 dark:text-gray-100 leading-snug">
            {question.question}
          </h3>

          <div className="space-y-4">
            {question.options.map((o, oIndex) => (
              <div
                key={oIndex}
                onClick={() => handleSelect(oIndex)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-3 ${
                  answers[currentQuestion] === oIndex
                    ? "border-purple-600 bg-purple-50 dark:border-[#a22df6] dark:bg-[#a22df6]/20 font-bold text-purple-900 dark:text-white"
                    : "border-gray-100 bg-white hover:border-purple-200 hover:bg-purple-50/50 dark:border-white/10 dark:bg-transparent dark:hover:bg-[#a22df6]/10 text-gray-700 dark:text-gray-300 font-medium"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                  answers[currentQuestion] === oIndex
                    ? "border-purple-600 dark:border-[#a22df6]"
                    : "border-gray-300 dark:border-[#a22df6]/30"
                }`}>
                  {answers[currentQuestion] === oIndex && <div className="w-3 h-3 rounded-full bg-purple-600 dark:bg-[#a22df6]"></div>}
                </div>
                {o.text}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-100 dark:border-[#a22df6]/20">
            <button
              onClick={handlePrev}
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-600 rounded-xl font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>

              {currentQuestion === totalQuestions - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 flex items-center justify-center gap-2 bg-[#a22df6] hover:bg-[#8c22d8] text-white rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Submitting...
                    </div>
                  ) : "Submit Quiz"}
                </button>
              ) : (
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 dark:bg-[#a22df6] dark:hover:bg-[#8c22d8] text-white rounded-xl font-bold transition-all transform hover:scale-105"
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