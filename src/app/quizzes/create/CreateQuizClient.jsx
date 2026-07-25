"use client";
export const dynamic = "force-dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { Plus, Trash2, ArrowLeft, CheckCircle } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const [questions, setQuestions] = useState([
    {
      question: "",
      options: ["", ""],
      correctIndex: null,
      points: 10,
      timeLimit: 20,
      explanation: "",
    },
  ]);

  // 🔥 NEW SCHEDULE SYSTEM
  const [startAt, setStartAt] = useState("");
  const [closeAt, setCloseAt] = useState("");
  const [attemptTime, setAttemptTime] = useState(20);
  const [hasTimeLimit, setHasTimeLimit] = useState(true);

  /* ---------------- LOAD QUIZ (EDIT MODE) ---------------- */

  useEffect(() => {
    if (!editId) return;

    const loadQuiz = async () => {
      const res = await fetch(`/api/quizzes/${editId}`);
      if (!res.ok) return;
const data = await res.json();

      setTitle(data.title);

      setQuestions(
        data.questions.map((q) => ({
          question: q.question,
          options: q.options.map((o) => o.text),
          correctIndex: q.options.findIndex((o) => o.isCorrect),
          points: q.points,
          timeLimit: q.timeLimit,
          explanation: q.explanation,
        }))
      );

      if (data.startAt) {
        setStartAt(new Date(data.startAt).toLocaleString("sv-SE").slice(0, 16));
      }

      if (data.closeAt) {
        setCloseAt(new Date(data.closeAt).toLocaleString("sv-SE").slice(0, 16));
      }
      if (data.attemptTime) {
        setAttemptTime(data.attemptTime);
        setHasTimeLimit(true);
      } else if (data.attemptTime === null || data.attemptTime === 0) {
        setHasTimeLimit(false);
      }
    };

    loadQuiz();
  }, [editId]);

  /* ---------------- HELPERS ---------------- */

  const updateQuestion = (qIndex, key, value) => {
    const copy = [...questions];
    copy[qIndex][key] = value;
    setQuestions(copy);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const copy = [...questions];
    copy[qIndex].options[oIndex] = value;
    setQuestions(copy);
  };

  const addOption = (qIndex) => {
    const copy = [...questions];
    if (copy[qIndex].options.length >= 6) return;
    copy[qIndex].options.push("");
    setQuestions(copy);
  };

  const removeOption = (qIndex, oIndex) => {
    const copy = [...questions];
    if (copy[qIndex].options.length <= 2) return;

    copy[qIndex].options.splice(oIndex, 1);

    if (copy[qIndex].correctIndex === oIndex) {
      copy[qIndex].correctIndex = null;
    }

    setQuestions(copy);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", ""],
        correctIndex: null,
        points: 10,
        timeLimit: 20,
        explanation: "",
      },
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  /* ---------------- VALIDATION ---------------- */

  const isValid =
    title.trim() &&
    questions.every(
      (q) =>
        q.question.trim() &&
        q.options.filter((o) => o.trim()).length >= 2 &&
        q.correctIndex !== null
    );

  /* ---------------- SAVE QUIZ ---------------- */

  const saveQuiz = async () => {
    if (!isValid) return;

    setLoading(true);

    const now = new Date();

const startTimestamp = startAt
  ? new Date(startAt)
  : now;

const closeTimestamp = closeAt
  ? new Date(closeAt)
  : null;
  /* 🔒 PREVENT INVALID SCHEDULE */
if (closeTimestamp && startTimestamp > closeTimestamp) {
  alert("Close time must be after start time.");
  setLoading(false);
  return;
}

    // 🔥 AUTO STATUS LOGIC
    let status = "active";

    if (startTimestamp && startTimestamp > now) status = "scheduled";
if (closeTimestamp && now > closeTimestamp) status = "closed";

    const quizPayload = {
      title: title.trim(),
      questions: questions.map((q) => ({
        question: q.question.trim(),
        options: q.options.map((o, i) => ({
          text: o.trim(),
          isCorrect: i === q.correctIndex,
        })),
        points: Number(q.points),
        timeLimit: Number(q.timeLimit),
        explanation: q.explanation.trim(),
      })),
      startAt: startTimestamp,
      closeAt: closeTimestamp,
      attemptTime: hasTimeLimit ? (Number(attemptTime) || 1) : null,
      status,
    };

    try {
      if (editId) {
        await fetch(`/api/quizzes/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(quizPayload),
        });
      } else {
        await fetch("/api/quizzes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(quizPayload),
        });
      }

      router.push("/quizzes");
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-bg-4 text-text-1">

      {/* HEADER */}
      <div className="flex items-center justify-center relative px-6 py-4 border-b border-border-2">
        <ArrowLeft
          onClick={() => router.back()}
          className="absolute left-6 w-5 h-5 cursor-pointer text-text-3 hover:text-text-1"
        />
        <h1 className="font-semibold text-lg">
          {editId ? "Edit Quiz" : "Create Quiz"}
        </h1>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">

        {/* TITLE */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Quiz Title"
          className="w-full bg-bg-2 border border-border-2 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-600"
        />

        {/* QUESTIONS */}
        {questions.map((q, qIndex) => (
          <div
            key={qIndex}
            className="bg-bg-2/60 border border-border-2 rounded-2xl p-6 space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">
                Question {qIndex + 1}
              </h3>

              {questions.length > 1 && (
                <Trash2
                  onClick={() => removeQuestion(qIndex)}
                  className="w-4 h-4 text-red-500 cursor-pointer"
                />
              )}
            </div>

            <textarea
              rows={2}
              value={q.question}
              onChange={(e) =>
                updateQuestion(qIndex, "question", e.target.value)
              }
              placeholder="Enter question"
              className="w-full bg-bg-2 border border-border-2 rounded-xl p-4 outline-none focus:ring-2 focus:ring-purple-600"
            />

            <div className="space-y-3">
              {q.options.map((o, oIndex) => (
                <div
                  key={oIndex}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    q.correctIndex === oIndex
                      ? "border-green-500"
                      : "border-border-2"
                  }`}
                >
                  <span className="text-purple-400 font-bold">
                    {String.fromCharCode(65 + oIndex)}
                  </span>

                  <input
                    value={o}
                    onChange={(e) =>
                      updateOption(qIndex, oIndex, e.target.value)
                    }
                    placeholder={`Option ${oIndex + 1}`}
                    className="flex-1 bg-transparent outline-none"
                  />

                  <CheckCircle
                    onClick={() =>
                      updateQuestion(qIndex, "correctIndex", oIndex)
                    }
                    className={`w-5 h-5 cursor-pointer ${
                      q.correctIndex === oIndex
                        ? "text-green-500"
                        : "text-text-4"
                    }`}
                  />

                  {q.options.length > 2 && (
                    <Trash2
                      onClick={() =>
                        removeOption(qIndex, oIndex)
                      }
                      className="w-4 h-4 text-text-4 hover:text-red-500 cursor-pointer"
                    />
                  )}
                </div>
              ))}

              {q.options.length < 6 && (
                <button
                  onClick={() => addOption(qIndex)}
                  className="text-purple-400 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Option
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          onClick={addQuestion}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>

        {/* 🔥 SCHEDULE SECTION */}
        <div className="bg-bg-2/60 border border-border-2 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold">Quiz Schedule</h3>

          <div>
            <label className="block text-sm text-text-3">
              Start At
            </label>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="bg-bg-2 border border-border-2 rounded-lg p-3 w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-text-3 mt-4">
              Close At (Hard Lock Time)
            </label>
            <input
  type="datetime-local"
  value={closeAt}
  min={startAt}
  onChange={(e) => setCloseAt(e.target.value)}
  className="bg-bg-2 border border-border-2 rounded-lg p-3 w-full"
/>
          </div>
          <div>
            <div className="flex items-center justify-between mt-4 mb-2">
              <label className="block text-sm text-text-3">
                Time Limit Per Attempt (minutes)
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!hasTimeLimit}
                  onChange={(e) => setHasTimeLimit(!e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-600 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="text-sm text-text-3 font-medium">No Time Limit</span>
              </label>
            </div>

            <input
              type="number"
              min="1"
              max="120"
              value={attemptTime}
              disabled={!hasTimeLimit}
              onChange={(e) => setAttemptTime(Math.max(1, Number(e.target.value)))}
              className={`bg-bg-2 border border-border-2 rounded-lg p-3 w-full ${!hasTimeLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>

        {/* PUBLISH */}
        <div className="flex justify-end pt-6">
          <button
            disabled={!isValid || loading}
            onClick={saveQuiz}
            className={`px-8 py-3 w-auto rounded-xl font-bold text-white transition-all shadow-sm ${
              isValid
                ? "bg-purple-600 hover:bg-purple-700 shadow-md active:scale-95"
                : "bg-gray-400 dark:bg-gray-700 cursor-not-allowed opacity-60"
            }`}
          >
            {loading
              ? "Saving..."
              : editId
              ? "Update Quiz"
              : "Publish Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}