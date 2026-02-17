"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  ClipboardList,
  ZapOff,
  ArrowLeft,
  Calendar,
  User,
  Gift,
  CheckCircle,
  Zap,
  Eye,
  MapPin,
  Compass,
  ExternalLink,
  QrCode,
  List,
  TrendingUp,
  X as CloseIcon,
} from "lucide-react";

// ───────── HELPERS (email + notifications) ─────────
const getCurrentUserEmail = () => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("userEmail") || null;
  } catch {
    return null;
  }
};

const sendRegistrationNotification = (eventTitle) => {
  if (typeof window === "undefined") return;
  const email = getCurrentUserEmail();
  if (!email) return;

  let store = {};
  try {
    store = JSON.parse(localStorage.getItem("notifications") || "{}");
  } catch {
    store = {};
  }

  const userList = Array.isArray(store[email]) ? store[email] : [];
  const now = new Date();

  const newNotif = {
    id: Date.now(),
    title: `Thank you for registering for "${eventTitle}"`,
    message: `You have successfully registered for ${eventTitle}.`,
    createdAt: now.toISOString(),
    time: now.toLocaleTimeString(),
  };

  const updatedList = [newNotif, ...userList];
  store[email] = updatedList;

  try {
    localStorage.setItem("notifications", JSON.stringify(store));
  } catch {
    // ignore storage errors
  }

  window.dispatchEvent(new Event("confique:new-notification"));
};

const getRegistrationStatus = (start, end) => {
  const now = new Date();

  if (!start || !end) return { status: "open" };

  const s = new Date(start);
  const e = new Date(end);

  // normalize times (date-only fix)
  s.setHours(0,0,0,0);
  e.setHours(23,59,59,999);

  if (now < s) {
    const diffMs = s - now;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

    return { status: "notStarted", daysLeft: days };
  }

  if (now > e) return { status: "closed" };

  return { status: "open" };
};

const SectionTitle = ({ children, icon: Icon, className = "" }) => (
  <h2
    className={`text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-3 flex items-center ${className}`}
  >
    {Icon && <Icon className="w-6 h-6 mr-3 text-purple-400" />}
    {children}
  </h2>
);

const TabButton = ({ name, icon: Icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center space-x-2 px-6 py-3 text-base font-semibold border-b-2 transition-all duration-300
      ${
        isActive
          ? "border-purple-600 text-white"
          : "border-transparent text-gray-400 hover:text-white hover:border-gray-700"
      }
      whitespace-nowrap
    `}
  >
    {Icon && <Icon className="w-5 h-5" />}
    <span>{name}</span>
  </button>
);

const RelatedEventCard = ({ event, onDetailsClick }) => (
  <div
    className="bg-gray-900 border border-gray-800 rounded-xl p-4 transition-transform duration-300 hover:scale-[1.02] cursor-pointer shadow-lg hover:shadow-purple-500/20"
    onClick={() => onDetailsClick(event.id)}
  >
    <div className="flex items-start justify-between mb-4">
      {/* LEFT: Trending + Title */}
      <div className="flex items-center space-x-3">
        <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0" />

        <h4 className="text-lg font-extrabold text-white truncate max-w-[180px]">
          {event.title}
        </h4>
      </div>

      {/* RIGHT: Event Poster */}
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-800 border border-gray-700 flex-shrink-0">
        <img
          src={event.poster || event.banner}
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>
    </div>

    {/* Info */}
    <div className="text-gray-400 text-sm space-y-3">
      <div className="flex items-center">
        <Calendar className="w-4 h-4 mr-3 flex-shrink-0" />
        <span className="flex justify-between w-full">
          <span>Date:</span>
          <span className="font-medium text-white">
            {event.date?.split(",")[0]?.trim() || "TBD"}
          </span>
        </span>
      </div>

      <div className="flex items-center">
        <Compass className="w-4 h-4 mr-3 flex-shrink-0" />
        <span className="flex justify-between w-full">
          <span>Category:</span>
          <span className="font-medium text-purple-400">
            {event.category}
          </span>
        </span>
      </div>

      <div className="flex items-center">
        <Eye className="w-4 h-4 mr-3 flex-shrink-0" />
        <span className="flex justify-between w-full">
          <span>Impressions:</span>
          <span className="font-medium text-white">
            {event.impressions?.toLocaleString() || "N/A"}
          </span>
        </span>
      </div>
    </div>
  </div>
);


const EventDetailsPage = ({
  event: displayEvent,
  onBackClick,
  EVENT_DETAIL_DATA_MOCK,
  relatedEvents = [],
  onDetailsClick,
}) => {
  const [activeTab, setActiveTab] = useState("Details");
  const [registrationStatus, setRegistrationStatus] = useState("Open");
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [ticketQty, setTicketQty] = useState({});   
  const [showPaymentBox, setShowPaymentBox] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [showBillAfterRef, setShowBillAfterRef] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [teamMode, setTeamMode] = useState("create"); // default create
const [teamName, setTeamName] = useState("");
const [teamCode, setTeamCode] = useState("");
const [createdTeamCode, setCreatedTeamCode] = useState(null);
const [teamMembersCount, setTeamMembersCount] = useState(1);
const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
  // First try localStorage (page refresh support)
  const stored = localStorage.getItem("userEmail");
  if (stored) setUserEmail(stored);

  // Listen for login from anywhere in app
  const handler = (e) => {
    const email = e.detail?.user?.email;
    if (email) {
      localStorage.setItem("userEmail", email);
      setUserEmail(email);
    }
  };

  window.addEventListener("confique:auth-changed", handler);

  return () => {
    window.removeEventListener("confique:auth-changed", handler);
  };
}, []);


  useEffect(() => {
    setActiveTab("Details");
  }, [displayEvent?.id]);

  useEffect(() => {
    setTicketQty({});
  }, [displayEvent?._id]);

  const {
    title,
    date,
    category,
    tagline,
    description,
    hostedBy,
    eligibility,
    prizes,
    isExternalRegistration,
    registrationUrl,
    poster,
    banner,
    impressions,
    rounds = [],
    isFree,
    pricingMode,        
    fixedPrice,          
    ticketTypes = [],   
    venue,
    isOnline,
    customFields = [],
    qrCode,
    tags = [],
    registrationStart,
    registrationEnd,
    registrations = [],
    teamConfig,
  } = displayEvent || {};
const regInfo = getRegistrationStatus(registrationStart, registrationEnd);
  const CURRENCY_SYMBOL = "₹";
  const totalAmount =
    pricingMode === "flexible"
      ? ticketTypes.reduce(
          (sum, t) => sum + (ticketQty[t.name] || 0) * t.price,
          0
        )
      : Number(fixedPrice || 0);

  const participationFormat =
    tags.find((tag) => tag.includes("Team") || tag.includes("Solo")) ||
    "Individual/Team (Check details)";

  const teamMatch = participationFormat.match(/\((\d+)\)/);
  const teamSize = teamMatch
    ? teamMatch[1]
    : participationFormat.includes("Solo")
    ? "1"
    : "Varies";

  const regStart = registrationStart || displayEvent?.registration?.start || "TBD";
  const regEnd = registrationEnd || displayEvent?.registration?.end || "TBD";
  
  const eventRounds =
    rounds.length > 0 ? rounds : EVENT_DETAIL_DATA_MOCK?.rounds || [];

  const hasCustomForm =
    !isExternalRegistration &&
    Array.isArray(customFields) &&
    customFields.length > 0;


  useEffect(() => {
  if (!userEmail) return;
  

  const eventId = displayEvent?.id || displayEvent?._id;

  // 1️⃣ Check backend registrations (global truth)
  if (displayEvent?.registrations) {
    const found = displayEvent.registrations.some(
      (r) => r.userEmail === userEmail
    );

    if (found) {
      setRegistrationStatus("Registered");

      // Sync to localStorage
      try {
        const raw =
          localStorage.getItem("confique:user_event_registrations") || "{}";
        const map = JSON.parse(raw);
        if (!map[userEmail]) map[userEmail] = [];
        if (!map[userEmail].includes(eventId)) {
          map[userEmail].push(eventId);
        }
        localStorage.setItem(
          "confique:user_event_registrations",
          JSON.stringify(map)
        );
      } catch {}

      return;
    }
  }

  // 2️⃣ Fallback to localStorage
  try {
    const raw =
      localStorage.getItem("confique:user_event_registrations") || "{}";
    const map = JSON.parse(raw);
    if (map[userEmail]?.includes(eventId)) {
      setRegistrationStatus("Registered");
      return;
    }
  } catch {}

  // 3️⃣ Otherwise use event date
  setRegistrationStatus(regInfo.status);
}, [userEmail, displayEvent?.registrations, displayEvent?.id, regInfo.status]);
// 🔄 Restore team info after refresh
useEffect(() => {
  if (!userEmail || !displayEvent?.teams) return;

  const myTeam = displayEvent.teams.find(t =>
    Array.isArray(t.members) && t.members.includes(userEmail)
  );

  if (myTeam) {
    setCreatedTeamCode(myTeam.code);
    setTeamMembersCount(myTeam.members.length);
  }
}, [userEmail, displayEvent?.teams]);


  const REG_KEY = "confique:event_registrations";

  const incrementStoredRegistration = (eventKey) => {
    try {
      const raw = localStorage.getItem(REG_KEY) || "{}";
      const map = JSON.parse(raw);
      const current = Number(map[eventKey] || 0);
      map[eventKey] = current + 1;
      localStorage.setItem(REG_KEY, JSON.stringify(map));
      return map[eventKey];
    } catch (err) {
      console.error("Failed to persist registration:", err);
      return null;
    }
  };

  const handleFormChange = (fieldName, fieldType, value, checked) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: fieldType === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
  const errors = {};

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{10}$/;

  customFields
    .filter(f => f.name !== "Payment Ref (Last 4 digits)")
    .forEach((field) => {
      if (!field.required) return;

      const value = formData[field.name];

      // Empty check
      if (!value || value.toString().trim() === "") {
        errors[field.name] = "This field is required.";
        return;
      }

      // 📧 Email validation
      if (field.type === "email" && !emailRegex.test(value)) {
        errors[field.name] = "Please enter a valid email address.";
      }

      // 📱 Phone / Number validation (10 digits)
      if (
        (field.type === "number" || field.type === "tel") &&
        !phoneRegex.test(value.toString())
      ) {
        errors[field.name] = "Please enter a valid 10-digit number.";
      }

      // Checkbox
      if (field.type === "checkbox" && !value) {
        errors[field.name] = "This field is required.";
      }
    });

  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};
  const handleRegistrationSubmit = async (e) => {
   if (e && e.preventDefault) e.preventDefault();

if (isSubmitting) return;
setIsSubmitting(true);

if (!validateForm()) {
  setIsSubmitting(false);
  return;
}
// TEAM VALIDATION (FINAL AUTHORITY)
if (teamConfig?.enabled) {
  if (teamMode === "create" && !teamName.trim()) {
    alert("Please enter a team name");
    setIsSubmitting(false);
    return;
  }

  if (teamMode === "join" && !teamCode.trim()) {
    alert("Please enter a valid team code");
    setIsSubmitting(false);
    return;
  }
}
    if (!isFree && !showBillAfterRef) {
  alert("Please enter the last 4 digits of your payment reference");
  setIsSubmitting(false);
  return;
}

   if (!userEmail) {
  alert("Please login again");
  setIsSubmitting(false);
  return;
}

    try {
      const res = await fetch(`/api/events/${displayEvent.id || displayEvent._id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  userEmail,
  teamMode: teamConfig?.enabled ? teamMode : null,
  teamName: teamConfig?.enabled ? teamName : null,
  teamCode: teamConfig?.enabled ? teamCode : null,
  formData: {
    ...formData,
    paidAmount: totalAmount,
    selectedTickets: ticketQty,
  },
  paidRef: formData["Payment Ref (Last 4 digits)"] || null,
}),
      });

      const result = await res.json();
     if (result.teamCode) {
  setCreatedTeamCode(result.teamCode);
  setTeamMembersCount(result.membersCount || 1);
}
      if (!res.ok) throw new Error(result.error || "Registration failed");

      setRegistrationStatus("Registered");

// ❗ DO NOT close modal if team just created
if (!(teamMode === "create" && result.teamCode)) {
  setShowRegistrationForm(false);
}

      try {
        const eventKey = displayEvent?.id ?? displayEvent?.title ?? Date.now();
        const finalCount = incrementStoredRegistration(eventKey);

        window.dispatchEvent(
          new CustomEvent("confique:registrations-updated", {
            detail: {
              id: displayEvent?.id,
              title: displayEvent?.title,
              registrations: finalCount,
            },
          })
        );
      } catch (err) {
        console.error("Error updating local registrations:", err);
      }

      sendRegistrationNotification(title);
      
   } catch (err) {
  console.error("Registration Error:", err);
  alert(err.message);
} finally {
  setIsSubmitting(false);
}
  };

  const handleCloseForm = () => {
    setShowRegistrationForm(false);
    setFormErrors({});
  };

  const handleRegister = () => {
    if (registrationStatus === "Registered" || regInfo.status !== "open") return;

    if (isExternalRegistration && registrationUrl) {
      window.open(registrationUrl, "_blank");
      return;
    }

    setShowBilling(false);
    setShowBillAfterRef(false);
    setFormData({});
    setTicketQty({});
    setShowRegistrationForm(true);
  };

 const getButtonProps = () => {
  if (registrationStatus === "Registered") {
    return {
      text: "Registered",
      className:
        "w-full py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg flex items-center justify-center",
      disabled: true,
      Icon: CheckCircle,
    };
  }

  if (regInfo.status === "notStarted") {
    return {
      text: `Opens in ${regInfo.daysLeft} day${regInfo.daysLeft > 1 ? "s" : ""}`,
      className:
        "w-full py-3 bg-gray-700 text-gray-300 font-bold rounded-lg cursor-not-allowed flex items-center justify-center",
      disabled: true,
      Icon: Clock,
    };
  }

  if (regInfo.status === "closed") {
    return {
      text: "Registration Closed",
      className:
        "w-full py-3 bg-gray-700 text-gray-400 font-bold rounded-lg cursor-not-allowed flex items-center justify-center",
      disabled: true,
      Icon: Clock,
    };
  }

  if (isExternalRegistration) {
    return {
      text: "Go to External Registration",
      className:
        "w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 flex items-center justify-center",
      disabled: false,
      Icon: ExternalLink,
    };
  }

  return {
    text: "Register Now",
    className:
      "w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 flex items-center justify-center",
    disabled: false,
    Icon: ClipboardList,
  };
};

  const buttonProps = getButtonProps();

  const renderRegistrationFormModal = () => {
    if (!hasCustomForm || !showRegistrationForm || isExternalRegistration)
      return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
        onClick={handleCloseForm}
      >
        <div
          className="relative w-full max-w-lg bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleCloseForm}
            className="absolute top-3 right-3 p-1 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
          </button>

          <div className="mb-4">
            <p className="text-xs uppercase tracking-wide text-purple-400 font-semibold mb-1">
              Registration • {category}
            </p>
            <h3 className="text-xl font-bold text-white mb-1">
              {title}
            </h3>
            <p className="text-xs text-gray-400">
              Please fill the details below to complete your registration.
            </p>
          </div>

          <form
            onSubmit={handleRegistrationSubmit}
            className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
          >
            {/* TEAM SECTION */}
{teamConfig?.enabled && !showBilling && (
  <div className="space-y-4 p-4 bg-gray-800 rounded-xl border border-purple-600">

    <p className="text-purple-400 font-semibold text-sm">
      Team Registration (Max {teamConfig.maxMembers} Members)
    </p>

    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => setTeamMode("create")}
        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
          teamMode === "create"
            ? "bg-purple-600 text-white"
            : "bg-gray-700 text-gray-300"
        }`}
      >
        Create Team
      </button>

      <button
        type="button"
        onClick={() => setTeamMode("join")}
        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
          teamMode === "join"
            ? "bg-purple-600 text-white"
            : "bg-gray-700 text-gray-300"
        }`}
      >
        Join Team
      </button>
    </div>

    {teamMode === "create" && (
      <input
        type="text"
        placeholder="Enter Team Name"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
      />
    )}
{createdTeamCode && (
  <div className="bg-green-900/40 border border-green-500 rounded-lg p-3 text-sm text-green-300 mt-3">

    <p className="font-semibold text-center">
      ✅ Team Created Successfully
    </p>

    <div
      className="mt-2 font-bold text-white text-center tracking-widest text-lg cursor-pointer"
      onClick={() => navigator.clipboard.writeText(createdTeamCode)}
    >
      {createdTeamCode}
    </div>

    <p className="text-xs text-gray-400 mt-1 text-center">
      Tap to copy & share with teammates
    </p>

  </div>
)}

    {teamMode === "join" && (
      <input
        type="text"
        placeholder="Enter Team Code"
        value={teamCode}
        onChange={(e) => setTeamCode(e.target.value)}
        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
      />
    )}
  </div>
)}
            {/* Step 1: Show Form Fields */}
            {!showBilling && customFields
              .filter(f => f.name !== "Payment Ref (Last 4 digits)")
              .map((field, index) => {
                const value = formData[field.name] ?? (field.type === "checkbox" ? false : "");
                const error = formErrors[field.name];

                return (
                  <div key={index} className="space-y-1">
                    {field.type === "checkbox" ? (
                      <div className="flex items-center space-x-2 mt-1">
                        <input
                          type="checkbox"
                          id={`field-${index}`}
                          checked={!!value}
                          onChange={(e) =>
                            handleFormChange(field.name, field.type, e.target.value, e.target.checked)
                          }
                          className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                        />
                        <label htmlFor={`field-${index}`} className="text-sm text-gray-200">
                          {field.name} {field.required && <span className="text-red-500">*</span>}
                        </label>
                      </div>
                    ) : (
                      <>
                        <label className="text-xs font-medium text-gray-300 block mb-1">
                          {field.name} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type={field.type || "text"}
                          value={value}
                          onChange={(e) =>
                            handleFormChange(field.name, field.type, e.target.value, false)
                          }
                          className={`w-full px-3 py-2 rounded-lg bg-gray-800 border text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                            error ? "border-red-500" : "border-gray-700"
                          }`}
                          placeholder={field.name}
                        />
                      </>
                    )}
                    {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
                  </div>
                );
              })}

            {/* Step 2: Show Billing Details & Transaction ID Input */}
            {showBilling && !isFree && (
              <div className="mt-6 p-4 rounded-xl bg-gray-800 border border-purple-600 space-y-4">
                <SectionTitle icon={List} className="text-lg">Bill Details</SectionTitle>
                
                {pricingMode === "flexible" && ticketTypes.map((t) => (
                  <div key={t.name} className="flex justify-between items-center text-sm">
                    <span className="text-white">{t.name} – ₹{t.price}</span>
                    <input
                      type="number"
                      min="0"
                      value={ticketQty[t.name] || 0}
                      onChange={(e) =>
                        setTicketQty((p) => ({ ...p, [t.name]: Number(e.target.value) }))
                      }
                      className="w-16 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-center"
                    />
                  </div>
                ))}

                {pricingMode === "fixed" && (
                  <p className="text-white font-semibold">Price: ₹{fixedPrice}</p>
                )}

                <div className="flex justify-between font-bold text-lg border-t border-gray-700 pt-3">
                  <span>Total Bill</span>
                  <span className="text-green-400">₹{totalAmount}</span>
                </div>

              

                {/* Step 3: Show QR Code and Transaction Summary after Ref Number */}
               {qrCode && (
  <div className="mt-4 p-4 bg-gray-950 border border-purple-600 rounded-xl space-y-4">

    {/* QR Code */}
    <div className="flex items-center space-x-4">
      <img
        src={qrCode}
        alt="QR Code"
        className="w-28 h-28 rounded-md border border-purple-500 bg-white p-2"
      />
      <div className="text-sm text-gray-300">
        <p className="font-bold text-white">Scan & Pay</p>
        <p>Pay <span className="text-green-400 font-semibold">₹{totalAmount}</span></p>
        <p className="text-xs text-gray-400 mt-1">
          Use any UPI app
        </p>
      </div>
    </div>

    {/* Transaction Input BELOW QR */}
    <div className="pt-4 border-t border-gray-700">
      <label className="text-xs text-gray-400">
        Enter Last 4 digits of Transaction ID
      </label>
      <input
        type="text"
        maxLength="4"
        value={formData["Payment Ref (Last 4 digits)"] || ""}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, "");
          setFormData((p) => ({
            ...p,
            "Payment Ref (Last 4 digits)": val,
          }));
          setShowBillAfterRef(val.length === 4);
        }}
        className="w-full mt-2 px-3 py-2 rounded-lg bg-gray-900 border border-gray-600 text-white text-sm tracking-widest text-center"
        placeholder="1234"
      />

      {showBillAfterRef && (
        <p className="mt-2 text-xs text-green-400">
          ✔ Transaction captured: {formData["Payment Ref (Last 4 digits)"]}
        </p>
      )}
    </div>

  </div>
)}

              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              {!showBilling ? (
 <button
  type="button"
  disabled={isSubmitting}
  onClick={() => {
    if (isSubmitting) return;

    if (!validateForm()) return;

    if (isFree || pricingMode === "free") {
      setIsSubmitting(true);
      handleRegistrationSubmit();
    } else {
      setShowBilling(true);
    }
  }}
  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
    isSubmitting
      ? "bg-gray-700 cursor-not-allowed"
      : "bg-purple-600 hover:bg-purple-700 text-white"
  }`}
>
  {isSubmitting
    ? "Submitting..."
    : (isFree || pricingMode === "free")
    ? "Submit"
    : "Continue"}
</button>
) : (

                <button
  type="submit"
  disabled={
    isSubmitting ||
    !!createdTeamCode ||
    (!isFree && !showBillAfterRef)
  }
  className={`px-6 py-2 rounded-lg text-sm font-semibold text-white flex items-center transition-all ${
    isSubmitting || (!isFree && !showBillAfterRef)
      ? "bg-gray-700 cursor-not-allowed"
      : "bg-green-600 hover:bg-green-700"
  }`}
>
  <CheckCircle className="w-4 h-4 mr-2" />
  {isSubmitting
    ? "Submitting..."
    : createdTeamCode
    ? "Registered"
    : "Complete Registration"}
</button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Stages & Timeline":
        if (eventRounds.length === 0) {
          return (
            <div className="text-center py-10 text-gray-400">
              <ZapOff className="w-8 h-8 mx-auto mb-4 text-purple-400" />
              <p>Stage and timeline details are not yet available.</p>
            </div>
          );
        }

        return (
          <div className="space-y-12">
            <SectionTitle icon={Clock}>Event Stages</SectionTitle>
            {eventRounds.map((round, index) => (
              <div key={index} className="flex space-x-6">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${
                      index === 0 ? "bg-purple-600" : "bg-gray-700"
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < eventRounds.length - 1 && (
                    <div className="w-px h-full bg-gray-700 my-2" />
                  )}
                </div>
                <div className="pb-8 flex-grow">
                  <p className="text-sm text-purple-400 font-medium flex items-center mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    {round.date || "TBD"}
                  </p>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {round.title || `Round ${index + 1}`}
                  </h3>
                  <p className="text-gray-300">
                    {round.description || "Details coming soon."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        );

      case "Details":
        return (
          <div className="space-y-8">
            <SectionTitle icon={ClipboardList}>{title} Overview</SectionTitle>
           <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
  {description || "No detailed description provided."}
</p>
            <p className="text-gray-300 text-lg leading-relaxed">
              The event is scheduled for{" "}
              <span className="font-semibold text-purple-300">
                {date ? new Date(date).toLocaleDateString() : "TBD"}
              </span>
              . Get ready to participate in the{" "}
              <span className="font-semibold text-purple-300">
                {category}
              </span>{" "}
              category!
            </p>

            <SectionTitle icon={User}>Organizer & Contact</SectionTitle>
            <p className="text-gray-300">
              Hosted by: <span className="font-semibold text-purple-400">{hostedBy || "Host"}</span>
            </p>
            <p className="text-gray-300">
              Location: <span className="font-semibold text-purple-400">{venue || (isOnline ? "Online" : "TBD")}</span>
            </p>

            {!isExternalRegistration && (
              <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-yellow-500">
                <p className="font-semibold text-yellow-300 mb-2">Registration Notes:</p>
                <p className="text-sm text-gray-300 mb-3">
                  This event uses our internal registration system.
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={onBackClick}
          className="flex items-center text-gray-400 hover:text-purple-400 transition-colors font-semibold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to All Events
        </button>
      </div>

      <div className="relative h-[280px] overflow-hidden">
        <img
          src={banner || poster}
          alt={title}
          className="w-full h-full object-cover object-center opacity-70"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/70 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <p className="text-purple-400 font-semibold text-sm uppercase mb-2">
              {category} by {hostedBy || "Host"}
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              {title}
            </h1>
            <p className="text-xl text-gray-300 mt-2">{tagline || title}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-8">
            <div className="flex overflow-x-auto border-b border-gray-800 mb-8">
              {[
                { name: "Details", icon: ClipboardList },
                { name: "Stages & Timeline", icon: Clock },
              ].map((tab) => (
                <TabButton
                  key={tab.name}
                  name={tab.name}
                  icon={tab.icon}
                  isActive={activeTab === tab.name}
                  onClick={() => setActiveTab(tab.name)}
                />
              ))}
            </div>
            {renderContent()}
          </div>

          <div className="lg:col-span-4 mt-10 lg:mt-0 space-y-6">
            <div className="space-y-6 lg:sticky lg:top-20">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between text-white font-bold text-xl">
                  <p>Registration</p>
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>

                <div className="space-y-2 text-gray-300 text-sm">
                  <p className="flex justify-between">Main Date: <span className="text-white">{date ? new Date(date).toLocaleDateString() : "TBD"}</span></p>
                  <p className="flex justify-between">Start Date: <span className="text-white">{regStart}</span></p>
                  <p className="flex justify-between">End Date: <span className="text-white">{regEnd}</span></p>
                  <p className="flex justify-between">
                    Fees:
                    <span className={isFree ? "text-green-400" : "text-yellow-400"}>
                      {isFree
                        ? "Free"
                        : pricingMode === "fixed"
                        ? `${CURRENCY_SYMBOL}${fixedPrice}`
                        : "Multiple ticket types"}
                    </span>
                  </p>
                  <p className="flex justify-between">Format: <span className="text-blue-400">{participationFormat}</span></p>
                  {createdTeamCode && regInfo.status === "open" && (
  <div className="mt-3 p-3 rounded-lg bg-green-900/40 border border-green-500">

    <p className="text-green-300 text-center font-semibold">
      Team Code
    </p>

    <p className="text-white text-lg font-bold text-center tracking-widest">
      {createdTeamCode}
    </p>

    <p className="text-gray-300 text-center mt-1">
      Members: {teamMembersCount} / {teamConfig?.maxMembers}
    </p>

  </div>
)}

                </div>

                <button onClick={handleRegister} disabled={buttonProps.disabled} className={buttonProps.className}>
                  {buttonProps.Icon && <buttonProps.Icon className="w-5 h-5 mr-2" />}
                  {buttonProps.text}
                </button>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl space-y-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-lg font-semibold text-white">Eligibility</p>
                <p className="text-gray-300 text-sm">{eligibility || "Check official details."}</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl space-y-3">
                <Gift className="w-5 h-5 text-yellow-400" />
                <p className="text-lg font-semibold text-white">Prizes for Winners</p>
                <p className="text-gray-300 text-sm">{prizes || "Goodies and Certificates."}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-800">
          <SectionTitle icon={List}>Related Events</SectionTitle>
          {relatedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedEvents.map((event, index) => (
                <RelatedEventCard key={event.id || index} event={event} onDetailsClick={onDetailsClick} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400"><p>No related events found.</p></div>
          )}
        </div>
      </div>
      {renderRegistrationFormModal()}
    </div>
  );
};

export default EventDetailsPage;