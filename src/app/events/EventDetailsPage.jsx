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
  const [activeTab, setActiveTab] = useState("Stages & Timeline");
  const [registrationStatus, setRegistrationStatus] = useState("Open");
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});

  const {
    title,
    date,
    category,
    tagline,
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
    paymentAmount,
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
    const userEmail = getCurrentUserEmail();
    
    if (userEmail && registrations) {
      const isAlreadyRegistered = registrations.some(
        (reg) => reg.userEmail === userEmail
      );
      
      if (isAlreadyRegistered) {
        setRegistrationStatus("Registered");
        return;
      }
    }
    
    const status = checkEventStatus();
    setRegistrationStatus(status);
  }, [registrations, date, checkEventStatus]);

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
    customFields.forEach((field) => {
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

    const userEmail = getCurrentUserEmail();

    try {
      const res = await fetch(`/api/events/${displayEvent.id || displayEvent._id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: userEmail,
          formData: formData,
          paidRef: formData["Payment Ref (Last 4 digits)"] || null
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
    // Logic for Registered or Closed states (Do nothing)
    if (registrationStatus === "Registered" || registrationStatus === "Ended") return;

    if (isExternalRegistration && registrationUrl) {
      window.open(registrationUrl, "_blank");
      return;
    }

    if (!hasCustomForm) {
      handleRegistrationSubmit();
      return;
    }

    setShowRegistrationForm(true);
  };

  const getButtonProps = () => {
    if (registrationStatus === "Registered") {
      return {
        text: "Registered",
        className:
          "w-full py-3 bg-green-600 text-white font-bold rounded-lg transition-colors shadow-lg shadow-green-500/30 flex items-center justify-center",
        disabled: true, // ✅ Disabled once registered
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
            {customFields.map((field, index) => {
              const value =
                formData[field.name] ?? (field.type === "checkbox" ? false : "");
              const error = formErrors[field.name];

              let inputEl;

              if (field.type === "checkbox") {
                inputEl = (
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="checkbox"
                      id={`field-${index}`}
                      checked={!!value}
                      onChange={(e) =>
                        handleFormChange(
                          field.name,
                          field.type,
                          e.target.value,
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <label
                      htmlFor={`field-${index}`}
                      className="text-sm text-gray-200"
                    >
                      {field.name}{" "}
                      {field.required && <span className="text-red-500">*</span>}
                    </label>
                  </div>
                );
              } else {
                inputEl = (
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
                );
              }

              return (
                <div key={index} className="space-y-1">
                  {inputEl}
                  {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
                </div>
              );
            })}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-colors"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit & Register
              </button>
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
            <p className="text-gray-300 text-lg leading-relaxed">
              {tagline || "No short description provided."}
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
                { name: "Stages & Timeline", icon: Clock },
                { name: "Details", icon: ClipboardList },
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
                  <p className="flex justify-between">Fees: <span className={isFree ? "text-green-400" : "text-yellow-400"}>{isFree ? "Free" : `${CURRENCY_SYMBOL}${paymentAmount || "TBD"}`}</span></p>
                  <p className="flex justify-between">Format: <span className="text-blue-400">{participationFormat}</span></p>
                </div>

                {!isFree && qrCode && (
                  <div className="mt-4 p-3 rounded-lg bg-gray-800 border border-gray-700 flex items-center space-x-4">
                    <img src={qrCode} alt="QR" className="w-20 h-20 object-contain rounded-md border border-purple-500" />
                    <div className="text-xs text-gray-300"><p className="font-semibold text-white">Scan to Pay</p><p>Scan this QR to pay. Keep the ref number ready.</p></div>
                  </div>
                )}

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