"use client";

import { useState } from "react";
const WEB3FORMS_KEY = "7d16d42f-1ddc-4c10-8fde-00a2a54a797d";
export default function SettingsPage() {
  const [feedback, setFeedback] = useState("");
  const [complaint, setComplaint] = useState("");
  const [loading, setLoading] = useState(false);
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
const sendToWeb3Forms = async (type, message) => {
  setLoading(true);

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `Confique ${type}`,
        from_name: "Confique User",
        message: message,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert(`${type} sent successfully`);
      return true;
    } else {
      throw new Error("Web3Forms failed");
    }
  } catch (err) {
    alert("Submission failed. Try again.");
    return false;
  } finally {
    setLoading(false);
  }
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
<div className="flex justify-center mt-4">
  <button
    disabled={!feedback || loading}
    onClick={async () => {
      const ok = await sendToWeb3Forms("Feedback", feedback);
      if (ok) setFeedback("");
    }}
    className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-full disabled:opacity-50"
  >
    {loading ? "Sending..." : "Submit Feedback"}
  </button>
</div>

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
          <div className="flex justify-center mt-4">
  <button
    disabled={!complaint || loading}
    onClick={async () => {
      const ok = await sendToWeb3Forms("Complaint", complaint);
      if (ok) setComplaint("");
    }}
    className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-full disabled:opacity-50"
  >
    {loading ? "Sending..." : "Submit Complaint"}
  </button>
</div>
        </div>
      </div>
    </div>
  );
}
