import mongoose from "mongoose";

/* ================================
   QUESTION SCHEMA
================================ */

const QuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    options: [
      {
        text: {
          type: String,
          required: true,
          trim: true,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
      },
    ],

    points: {
      type: Number,
      default: 10,
      min: 1,
    },

    timeLimit: {
      type: Number,
      default: 20,
      min: 5,
    },

    explanation: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

/* ================================
   LEADERBOARD SCHEMA
================================ */

const LeaderboardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userName: {
      type: String,
      required: true,
    },

    score: {
      type: Number,
      required: true,
      min: 0,
    },

    timeTaken: {
      type: Number,
      required: true,
      min: 0,
    },

    submittedAt: {
  type: Date,
  required: true,
  default: Date.now,
},
  },
  { _id: false }
);

/* ================================
   MAIN QUIZ SCHEMA
================================ */

const QuizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // ❌ removed index:true to avoid duplicate index warning
    },

    questions: {
      type: [QuestionSchema],
      required: true,
      validate: {
        validator: (val) => val.length > 0,
        message: "Quiz must have at least one question",
      },
    },

    /* 🔥 SCHEDULING */
    startAt: {
  type: Date,
  default: null,
},

closeAt: {
  type: Date,
  default: null,
},

attemptTime: {
  type: Number, // minutes
  default: 20,
  min: 1,
},

    /* 🔥 STATUS SYSTEM */
    status: {
      type: String,
      enum: ["draft", "scheduled", "active", "closed"],
      default: "active",
    },

    leaderboard: {
      type: [LeaderboardSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

/* ================================
   AUTO STATUS LOGIC
================================ */

/*
IMPORTANT:
- Async function
- NO next()
- No crash
*/

QuizSchema.pre("save", async function () {
  const now = Date.now();

  if (this.closeAt && now > this.closeAt) {
    this.status = "closed";
  } else if (this.startAt && now < this.startAt) {
    this.status = "scheduled";   // ✅ FIXED (not draft)
  } else {
    this.status = "active";
  }
});

/* ================================
   INDEXES (PERFORMANCE)
================================ */

// Leaderboard sort
QuizSchema.index({ "leaderboard.score": -1 });

// Filter by creator
QuizSchema.index({ createdBy: 1 });

// Filter by status
QuizSchema.index({ status: 1 });

/* ================================
   EXPORT MODEL
================================ */

export default mongoose.models.Quiz ||
  mongoose.model("Quiz", QuizSchema);