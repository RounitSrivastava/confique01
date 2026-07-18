import mongoose from "mongoose";

/* ===============================
   REGISTRATION SUB-SCHEMA
================================ */
const RegistrationSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // All custom form data (dynamic)
    formData: {
      type: Object,
      default: {},
    },

    // For paid events (last 4 digits etc.)
    paidRef: {
      type: String,
      default: null,
    },

    // qr | gateway
paymentMethod: {
  type: String,
  enum: ["qr", "gateway"],
  default: "qr",
},

// Cashfree Order ID (gateway only)
orderId: {
  type: String,
  default: null,
},

// Final paid amount
paidAmount: {
  type: Number,
  default: 0,
},
// 🔥 Cloudinary Screenshot URL
screenshotUrl: {
  type: String,
  default: null,
},
    // Admin payment verification
    paymentStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    // 🔥 Selected ticket types by user
ticketSelection: {
  type: [
    {
      type: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      subtotal: {
        type: Number,
        required: true,
      },
    },
  ],
  default: [],
},

    createdAt: {
      type: Date,
      default: Date.now,
    },
    // Team info (optional)
teamCode: {
  type: String,
  default: null,
},

teamName: {
  type: String,
  default: null,
},
  },
  { _id: false }
);

/* ===============================
   MAIN EVENT SCHEMA
================================ */
const EventSchema = new mongoose.Schema(
  {
    /* ---------- BASIC INFO ---------- */
    title: {
      type: String,
      required: true,
      trim: true,
    },

    tagline: {
      type: String,
      default: "",
    },

    description: {              
  type: String,
  default: "",
},
    category: {
      type: String,
      required: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    // Primary date display field (kept for backward compat)
    date: {
      type: String,
      default: "",
    },

    // Actual start/end dates for the event
    eventStart: {
      type: String,
      default: "",
    },

    eventEnd: {
      type: String,
      default: "",
    },

    venue: {
      type: String,
      default: "",
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    /* ---------- MEDIA ---------- */
    poster: {
      type: String,
      required: true,
    },

    banner: {
      type: String,
      required: true,
    },

    /* ---------- HOST ---------- */
    hostedBy: {
      type: String,
      default: "",
    },

    eligibility: {
      type: String,
      default: "",
    },

    // ✅ NEW FIELD
groupLink: {
  type: String,
  default: "",
},
    /* ---------- PRICING & REGISTRATION ---------- */
    isFree: {
      type: Boolean,
      default: true,
    },

    pricingMode: {
      type: String,
      enum: ["free", "fixed", "flexible"],
      default: "free",
    },

    paymentMethod: {
  type: String,
  enum: ["qr", "gateway"],
  default: "qr",
},

    fixedPrice: {
      type: Number,
      default: 0,
    },

    ticketTypes: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],

    qrCode: {
      type: String,
      default: "",
    },

    registrationStart: {
      type: String,
      default: "",
    },

    registrationEnd: {
      type: String,
      default: "",
    },

    isExternalRegistration: {
      type: Boolean,
      default: false,
    },

    registrationUrl: {
      type: String,
      default: "",
    },

    /* ---------- CUSTOM FORM ---------- */
    customFields: [
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["text", "number", "email", "date", "checkbox", "file"],
      required: true,
    },

    required: {
      type: Boolean,
      default: false,
    },

    options: {
      type: [String],
      default: [],
    },

    // ✅ NEW FIELD (for single / multiple)
    selectionType: {
      type: String,
      enum: ["single", "multiple"],
      default: "multiple",
    },
  },
],
teamConfig: {
  enabled: {
    type: Boolean,
    default: false,
  },
  maxMembers: {
    type: Number,
    default: 1,
  },
},

    /* ---------- EVENT FLOW ---------- */
    rounds: {
      type: [Object],
      default: [],
    },

    prizes: {
      type: String,
      default: "",
    },

    /* ---------- ANALYTICS ---------- */
    impressions: {
      type: Number,
      default: 0,
    },

    registrationsCount: {
      type: Number,
      default: 0,
    },

    registrations: {
      type: [RegistrationSchema],
      default: [],
    },
    teams: [
  {
    name: String,
    code: String,
    leader: String,
    members: [String],
    createdAt: Date,
  },
],
  },
  {
    timestamps: true,
  }
);

/* ===============================
   🔒 PREVENT DUPLICATE REGISTRATION
================================ */
EventSchema.index(
  { _id: 1, "registrations.userEmail": 1 },
  { unique: true }
);
/* ===============================
   🔒 UNIQUE TEAM CODES
================================ */
EventSchema.index(
  { "teams.code": 1 },
  { sparse: true }
);
/* ===============================
   🔒 PRICING CONSISTENCY GUARD
================================ */
EventSchema.pre("save", function () {
  if (this.pricingMode !== "flexible") {
    this.ticketTypes = [];
  }

  if (this.pricingMode !== "fixed") {
    this.fixedPrice = 0;
  }

  if (this.pricingMode === "free") {
    this.isFree = true;
  }
});

/* ===============================
   EXPORT SAFE MODEL
================================ */
export default mongoose.models.Event ||
  mongoose.model("Event", EventSchema);
