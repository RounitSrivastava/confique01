import mongoose from "mongoose";

/* ===============================
   REGISTRATION SUB-SCHEMA
================================ */
const RegistrationSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      default: null,
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

    createdAt: {
      type: Date,
      default: Date.now,
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

    category: {
      type: String,
      required: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    /* ---------- DATE & VENUE ---------- */
    date: {
      type: String,
      required: true,
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

    /* ---------- REGISTRATION ---------- */
    isFree: {
      type: Boolean,
      default: true,
    },

    paymentAmount: {
      type: String,
      default: "",
    },

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
    customFields: {
      type: [Object],
      default: [],
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
  },
  {
    timestamps: true,
  }
);

/* ===============================
   EXPORT SAFE MODEL
================================ */
export default mongoose.models.Event ||
  mongoose.model("Event", EventSchema);
