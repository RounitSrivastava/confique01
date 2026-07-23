"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

export default function CreatePoll() {
  const { slug } = useParams();
  const router = useRouter();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const updateOption = (i, value) => {
    const copy = [...options];
    copy[i] = value;
    setOptions(copy);
  };

  const addOption = () => {
    if (options.length >= 6) return;
    setOptions([...options, ""]);
  };

  const removeOption = (i) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, idx) => idx !== i));
  };

  const isValid =
    question.trim().length > 0 &&
    options.filter((o) => o.trim()).length >= 2;

  const save = () => {
    if (!isValid) return;

    const cleaned = options.map(o => o.trim()).filter(Boolean);
    const email = localStorage.getItem("userEmail") || "guest";

    const polls = JSON.parse(localStorage.getItem("polls") || "[]");

    const newPoll = {
      id: Date.now(),
      type: "poll",
      slug,
      authorEmail: email,
      question: question.trim(),
      options: cleaned.map(o => ({ text: o, votes: 0 })),
      leaderboard: {},
      createdAt: new Date().toISOString()
    };

    localStorage.setItem("polls", JSON.stringify([newPoll, ...polls]));
    router.push(`/groups/${slug}`);
  };

  return (
    <div className="min-h-screen bg-bg-4 text-text-1">

      {/* Header */}
      <div className="flex items-center justify-center relative px-6 py-4 border-b border-border-2">
        <ArrowLeft
          onClick={() => router.back()}
          className="absolute left-6 w-5 h-5 cursor-pointer text-text-3 hover:text-text-1"
        />
        <h1 className="font-semibold text-lg">Create Poll</h1>
      </div>

      {/* Main Card */}
      <div className="max-w-2xl mx-auto px-6 pt-8 pb-16">

        {/* Question */}
        <label className="text-sm text-text-3">Poll Question</label>
        <textarea
          rows={3}
          maxLength={120}
          placeholder="Ask something engaging..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="mt-2 w-full bg-bg-2 border border-border-2 rounded-xl p-4 text-lg resize-none outline-none focus:ring-2 focus:ring-purple-600"
        />

        <p className="text-xs text-text-3 text-right mt-1">
          {question.length}/120
        </p>

        {/* Options */}
        <div className="mt-8 space-y-3">
          <label className="text-sm text-text-3">Options</label>

          {options.map((o, i) => (
            <div
              key={i}
              className="bg-bg-2 border border-border-2 rounded-xl px-4 py-3 hover:border-purple-500 transition"
            >
              <div className="flex items-center">
                <span className="text-purple-400 font-bold mr-3">
                  {String.fromCharCode(65 + i)}
                </span>

                <input
                  value={o}
                  placeholder={`Option ${i + 1}`}
                  onChange={(e) => updateOption(i, e.target.value)}
                  className="flex-1 bg-transparent outline-none placeholder-gray-500"
                />

                {options.length > 2 && (
                  <Trash2
                    onClick={() => removeOption(i)}
                    className="w-4 h-4 text-text-4 hover:text-red-500 cursor-pointer"
                  />
                )}
              </div>

              <div className="h-1 bg-bg-4 mt-3 rounded">
                <div className="h-1 bg-purple-500 rounded w-0" />
              </div>
            </div>
          ))}

          {options.length < 6 && (
            <button
              onClick={addOption}
              className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm mt-2"
            >
              <Plus className="w-4 h-4" />
              Add Option
            </button>
          )}
        </div>

        {/* Publish button INSIDE content */}
        <div className="mt-12 flex justify-center">
          <button
            disabled={!isValid}
            onClick={save}
            className={`w-full max-w-md py-3 rounded-xl font-semibold text-lg transition
              ${
                isValid
                  ? "bg-purple-600 hover:bg-purple-700 active:scale-95"
                  : "bg-bg-4 cursor-not-allowed"
              }
            `}
          >
            Publish Poll
          </button>
        </div>
      </div>
    </div>
  );
}