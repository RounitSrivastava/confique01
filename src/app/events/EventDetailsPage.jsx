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
    <div className="flex items-center space-x-3 mb-4">
      <TrendingUp className="w-5 h-5 text-green-400" />
      <h4 className="text-xl font-extrabold text-white truncate">
        {event.title}
      </h4>
    </div>

    <div className="text-gray-400 text-base space-y-3">
      <div className="flex items-center">
        <Calendar className="w-5 h-5 mr-4 flex-shrink-0" />
        <span className="flex justify-between w-full">
          <span className="w-24 flex-shrink-0">Date:</span>
          <span className="font-medium text-white text-right">
            {event.date?.split(",")[0]?.trim() || "TBD"}
          </span>
        </span>
      </div>

      <div className="flex items-center">
        <Compass className="w-5 h-5 mr-4 flex-shrink-0" />
        <span className="flex justify-between w-full">
          <span className="w-24 flex-shrink-0">Category:</span>
          <span className="font-medium text-purple-400 text-right">
            {event.category}
          </span>
        </span>
      </div>

      <div className="flex items-center">
        <Eye className="w-5 h-5 mr-4 flex-shrink-0" />
        <span className="flex justify-between w-full">
          <span className="w-24 flex-shrink-0">Impressions:</span>
          <span className="font-medium text-white text-right">
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
  } = displayEvent || {};

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

  const checkEventStatus = useCallback(() => {
    try {
      const eventDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (eventDate < today) return "Ended";
      return "Open";
    } catch {
      return "Open";
    }
  }, [date]);

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
  setRegistrationStatus(checkEventStatus());
}, [userEmail, displayEvent?.registrations, displayEvent?.id, checkEventStatus]);


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

    customFields
      .filter(f => f.name !== "Payment Ref (Last 4 digits)") 
      .forEach((field) => {
        if (!field.required) return;

        const value = formData[field.name];

        if (field.type === "checkbox") {
          if (!value) errors[field.name] = "This field is required.";
        } else {
          if (!value || value.toString().trim() === "")
            errors[field.name] = "This field is required.";
        }
      });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegistrationSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!validateForm()) return;

    if (!isFree && !showBillAfterRef) {
      alert("Please enter the last 4 digits of your payment reference");
      return;
    }

    if (!userEmail) {
  alert("Please login again");
  return;
}

    try {
      const res = await fetch(`/api/events/${displayEvent.id || displayEvent._id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  userEmail: userEmail,
          formData: {
            ...formData,
            paidAmount: totalAmount,
            selectedTickets: ticketQty,
          },
          paidRef: formData["Payment Ref (Last 4 digits)"] || null,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Registration failed");

      setRegistrationStatus("Registered");
      setShowRegistrationForm(false);

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
    }
  };

  const handleCloseForm = () => {
    setShowRegistrationForm(false);
    setFormErrors({});
  };

  const handleRegister = () => {
    if (registrationStatus === "Registered" || registrationStatus === "Ended") return;

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
          "w-full py-3 bg-green-600 text-white font-bold rounded-lg transition-colors shadow-lg shadow-green-500/30 flex items-center justify-center",
        disabled: true, 
        Icon: CheckCircle,
      };
    }

    if (registrationStatus === "Ended") {
      return {
        text: "Event Ended",
        className:
          "w-full py-3 bg-gray-600 text-gray-400 font-bold rounded-lg cursor-not-allowed shadow-none flex items-center justify-center",
        disabled: true,
        Icon: Clock,
      };
    }

    if (isExternalRegistration) {
      return {
        text: "Go to External Registration",
        className:
          "w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/30 flex items-center justify-center",
        disabled: false,
        Icon: ExternalLink,
      };
    }

    return {
      text: "Register Now",
      className:
        "w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/30 flex items-center justify-center",
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
    onClick={() => {
      if (!validateForm()) return;

      // If no payment step → directly submit
      if (isFree || pricingMode === "free") {
        handleRegistrationSubmit();
      } else {
        setShowBilling(true);
      }
    }}
    className="px-6 py-2 rounded-lg text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-all"
  >
    {(isFree || pricingMode === "free") ? "Submit" : "Continue"}
  </button>
) : (

                <button
                  type="submit"
                  disabled={!isFree && !showBillAfterRef}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold text-white flex items-center transition-all ${
                    (!isFree && !showBillAfterRef) 
                    ? "bg-gray-700 cursor-not-allowed" 
                    : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Registration
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