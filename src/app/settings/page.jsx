"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [feedback, setFeedback] = useState("");
  const [complaint, setComplaint] = useState("");
  const [status, setStatus] = useState(null); // { type: "feedback" | "complaint", message: string }

  const saveToLocalStorage = (key, value) => {
    if (typeof window === "undefined") return;

    try {
      const prev = JSON.parse(localStorage.getItem(key) || "[]") || [];
      const newEntry = {
        id: Date.now(),
        message: value,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify([newEntry, ...prev]));
    } catch (err) {
      console.error("Error saving to localStorage:", err);
    }
  };

  const handleSubmitFeedback = () => {
    const text = feedback.trim();
    if (!text) return;

    saveToLocalStorage("confique:feedbacks", text);
    setFeedback("");
    setStatus({
      type: "feedback",
      message: "Thanks for your feedback! Confique team will review it soon.",
    });
  };

  const handleSubmitComplaint = () => {
    const text = complaint.trim();
    if (!text) return;

    saveToLocalStorage("confique:complaints", text);
    setComplaint("");
    setStatus({
      type: "complaint",
      message: "Your issue has been recorded. Confique will look into it quickly.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white">
      {/* HEADING */}
      <h1 className="text-3xl font-bold mb-3">Settings</h1>

      {/* INFO TEXT */}
      <p className="text-sm text-gray-400 mb-6">
        Facing any issue with <span className="font-semibold">Confique</span>?  
        You can share it here - {" "}
        {/* <a
          href="mailto:confique01@gmail.com"
          className="text-purple-400 underline hover:text-purple-300"
        >
          confique01@gmail.com
        </a> */}
        
      </p>

      {/* STATUS MESSAGE */}
      {status && (
        <div className="mb-6 text-xs md:text-sm rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3">
          {status.message}
        </div>
      )}

      {/* TWO CARDS SIDE BY SIDE */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* FEEDBACK CARD */}
        <div className="bg-[#101010] border border-[#262626] rounded-2xl p-6 shadow-xl hover:shadow-purple-500/10 transition">
          <h2 className="text-xl font-semibold mb-2">Feedback</h2>
          <p className="text-sm text-gray-400 mb-4">
            Tell us what you like or what we can improve.
          </p>

          <textarea
            className="w-full rounded-xl bg-[#141414] border border-[#262626] px-4 py-3 text-sm outline-none 
            focus:border-purple-500 transition resize-none"
            rows={4}
            placeholder="Write your feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />

          <button
  onClick={handleSubmitFeedback}
  disabled={!feedback.trim()}
  className="mt-4 w-full py-2.5 rounded-xl text-sm font-medium 
  bg-gradient-to-r from-purple-500 to-purple-700 transition"
>
  Submit Feedback
</button>

        </div>

        {/* COMPLAINT CARD */}
        <div className="bg-[#101010] border border-[#262626] rounded-2xl p-6 shadow-xl hover:shadow-purple-500/10 transition">
          <h2 className="text-xl font-semibold mb-2">Complaint</h2>
          <p className="text-sm text-gray-400 mb-4">
            Run into an issue? Share it with Confique for a quick fix.
          </p>

          <textarea
            className="w-full rounded-xl bg-[#141414] border border-[#262626] px-4 py-3 text-sm outline-none 
            focus:border-purple-500 transition resize-none"
            rows={4}
            placeholder="Write your complaint..."
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
          />

         <button
  onClick={handleSubmitComplaint}
  disabled={!complaint.trim()}
  className="mt-4 w-full py-2.5 rounded-xl text-sm font-medium 
  bg-gradient-to-r from-purple-500 to-purple-700 transition"
>
  Submit Complaint
</button>

        </div>
      </div>
    </div>
  );
}
