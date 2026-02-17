"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Zap, Code, Shirt, Medal, Compass, BookOpen, Clock, MapPin,
  Calendar, User, Plus, X, ClipboardList, Gift, ChevronDown, ChevronUp,
  CheckCircle, ArrowLeft, MessageSquare, Menu, Upload, ExternalLink, QrCode, Trash2,Briefcase 
} from "lucide-react";
const HOST_GUIDE_DOC_URL = "https://docs.google.com/document/d/1G4t0GbXgSK4DfZxK8OWpqUrF4AeeRaDr2HXM_ZOFOKk/edit?usp=sharing";

// Re-using the categories
const categories = [
  { name: "Tech", icon: Code },
{ name: "Entrepreneurship", icon: Briefcase },
  { name: "Competition", icon: Medal },
  { name: "Cultural", icon: Compass },
  { name: "Seminar", icon: BookOpen },
  { name: "Workshop", icon: Clock },
  { name: "Others", icon: Zap },
];
const DEFAULT_BANNER_URL = "/website bg.png"; // put this image inside /public

const TagOptions = ["Solo", "Free", "Paid"];

// --- CLOUDINARY UPLOAD HELPER ---
const uploadToCloudinary = async (file, folder = "events") => {
  if (!file) return null;
  // ✅ If file is already a URL string (from editing), don't re-upload
  if (typeof file === "string" && file.startsWith("http")) return file;

  try {
    const sigRes = await fetch(`/api/cloudinary/sign?folder=${folder}`);
    const sigData = await sigRes.json();
    if (!sigData.ok) throw new Error("Failed to get upload signature");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sigData.apiKey);
    formData.append("timestamp", sigData.timestamp);
    formData.append("signature", sigData.signature);
    formData.append("folder", folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};

const SectionTitle = ({ children, icon: Icon, className = "" }) => (
  <h2 className={`text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-3 flex items-center ${className}`}>
    {Icon && <Icon className="w-6 h-6 mr-3 text-purple-400" />}
    {children}
  </h2>
);

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
  disabled = false,
}) => (
  <div className={`space-y-2 ${className}`}>
    <label className="text-sm font-medium text-gray-400 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={`w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${disabled ? "opacity-50 cursor-not-allowed bg-gray-900" : ""}`}
    />
  </div>
);

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
}) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-400 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={`w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors cursor-pointer ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <option value="" disabled>
        Select {label}
      </option>
      {options.map((option) => (
        <option
          key={option.name || option}
          value={option.name || option}
          className="bg-gray-800 text-white"
        >
          {option.name || option}
        </option>
      ))}
    </select>
  </div>
);

const TagSelector = ({ selectedTags, onTagToggle }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-400 block">Event Tags</label>
    <div className="flex flex-wrap gap-2">
      {TagOptions.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onTagToggle(tag)}
          className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-200 ${
            selectedTags.includes(tag)
              ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/30"
              : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  </div>
);

const ImageUploader = ({
  label,
  ratioTip,
  name,
  file,
  previewUrl,
  onFileChange,
  onRemove,
  required = true,
}) => {
  const fileInputRef = useRef(null);
  const isRequired = required && !file;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-400 block">
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>
      {ratioTip && (
        <p className="text-xs text-purple-300 bg-gray-800 p-2 rounded-lg">
          {ratioTip}
        </p>
      )}

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={onFileChange}
        required={isRequired}
        style={{ display: "none" }}
        name={name}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-full py-3 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
      >
        <Upload className="w-5 h-5 text-purple-400" />
        <span>{file instanceof File ? file.name : (file ? "Image Uploaded" : "Click to Upload Image")}</span>
      </button>

      {previewUrl && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg flex items-center space-x-4">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-20 h-28 object-cover rounded-md border border-purple-500"
          />
          <div className="text-sm text-gray-400">
            <p className="text-white font-medium line-clamp-1">{file instanceof File ? file.name : "Current Event Image"}</p>
            {file instanceof File && <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>}
            <button
              type="button"
              onClick={onRemove}
              className="text-red-400 hover:text-red-500 mt-1 flex items-center text-xs"
            >
              <X className="w-3 h-3 mr-1" /> Remove Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const HostEventPage = ({ parentPathname = "/events", onEventHosted, initialData }) => {
  const router = useRouter();
  const PAYMENT_REF_FIELD_NAME = "Payment Ref (Last 4 digits)";
  const CURRENCY_SYMBOL = "₹";
  const CURRENCY_CODE = "INR";
  const isEditMode = !!initialData;

  // ✅ Pre-fill Helper: Convert database ISO dates to YYYY-MM-DD for HTML inputs
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toISOString().split('T')[0];
    } catch {
      return "";
    }
  };

  const [eventData, setEventData] = useState({
    teamConfig: initialData?.teamConfig || {
  enabled: false,
  maxMembers: 4,
},
    title: initialData?.title || "",
    venue: initialData?.venue || "",
    eventStart: formatDate(initialData?.eventStart),
eventEnd: formatDate(initialData?.eventEnd),
    posterPreviewUrl: initialData?.poster || "",
    posterFile: initialData?.poster || null,
    bannerPreviewUrl: initialData?.banner || "",
    bannerFile: initialData?.banner || null,
    tags: initialData?.tags || ["Free"], 
    category: initialData?.category || "",
    tagline: initialData?.tagline || "",
    description: initialData?.description || "",
    hostedBy: initialData?.hostedBy || "", 
    eligibility: initialData?.eligibility || "",
    isOnline: initialData?.isOnline || false,
    isFree: initialData?.isFree ?? true,
    registrationStart: formatDate(initialData?.registrationStart),
    registrationEnd: formatDate(initialData?.registrationEnd),
    prizes: initialData?.prizes || "",
    rounds: initialData?.rounds || [
      { title: "Registration Opens", description: "Sign up and form your teams.", date: "" },
    ],
    isPaymentRequired: initialData?.isPaymentRequired || false, // 🔥 NEW pricing system
pricingMode: initialData?.pricingMode || "fixed",   // fixed | flexible
fixedPrice: initialData?.fixedPrice || "",
ticketTypes: initialData?.ticketTypes || [],       // host will create their own
paymentCurrency: CURRENCY_CODE,
    qrCodePreviewUrl: initialData?.qrCode || "",
    qrCodeFile: initialData?.qrCode || null,
    isExternalRegistration: initialData?.isExternalRegistration || false,
    registrationUrl: initialData?.registrationUrl || "",
    customFields: initialData?.customFields || [
      { name: "Team Leader Name", type: "text", required: true },
      { name: "Team Leader Email", type: "email", required: true },
    ],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // ✅ CRITICAL FIX: Update state if initialData changes (ensures form fills after data fetch)
  useEffect(() => {
  if (initialData) {
    setEventData({
      teamConfig: initialData.teamConfig || {
        enabled: false,
        maxMembers: 4,
      },

      title: initialData.title || "",
      venue: initialData.venue || "",
      eventStart: formatDate(initialData.eventStart),
eventEnd: formatDate(initialData.eventEnd),
      posterPreviewUrl: initialData.poster || "",
      posterFile: initialData.poster || null,
      bannerPreviewUrl: initialData.banner || "",
      bannerFile: initialData.banner || null,
      tags: initialData.tags || ["Free"],
      category: initialData.category || "",
      tagline: initialData.tagline || "",
      description: initialData.description || "",
      hostedBy: initialData.hostedBy || "",
      eligibility: initialData.eligibility || "",
      isOnline: initialData.isOnline || false,
      isFree: initialData.isFree ?? true,
      registrationStart: formatDate(initialData.registrationStart),
      registrationEnd: formatDate(initialData.registrationEnd),
      prizes: initialData.prizes || "",
      rounds: initialData.rounds || [],
      pricingMode: initialData.pricingMode || "fixed",
      fixedPrice: initialData.fixedPrice || "",
      ticketTypes: initialData.ticketTypes || [],
      qrCodePreviewUrl: initialData.qrCode || "",
      qrCodeFile: initialData.qrCode || null,
      isExternalRegistration: initialData.isExternalRegistration || false,
      registrationUrl: initialData.registrationUrl || "",
      customFields: initialData.customFields || [],
    });
  }
}, [initialData]);

  useEffect(() => {
    if (!eventData.hostedBy) {
        const fetchProfile = async () => {
          try {
            const res = await fetch("/api/me");
            if (res.ok) {
              const data = await res.json();
              if (data?.user?.name) {
                setEventData(prev => ({ ...prev, hostedBy: data.user.name }));
              }
            }
          } catch (err) {
            console.error("Profile sync error:", err);
          }
        };
        fetchProfile();
    }
  }, []);

  const isPaidEvent = !eventData.isFree;
  const showQrCodeFields = isPaidEvent && !eventData.isExternalRegistration;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e, fileKey, previewKey) => {
    const file = e.target?.files ? e.target.files[0] : null;
    if (file) {
      if (eventData[previewKey] && !eventData[previewKey].startsWith('http')) URL.revokeObjectURL(eventData[previewKey]);
      const previewUrl = URL.createObjectURL(file);
      setEventData((prev) => ({
        ...prev,
        [fileKey]: file,
        [previewKey]: previewUrl,
      }));
    } else {
      if (eventData[previewKey] && !eventData[previewKey].startsWith('http')) URL.revokeObjectURL(eventData[previewKey]);
      setEventData((prev) => ({
        ...prev,
        [fileKey]: null,
        [previewKey]: "",
      }));
    }
  };

  const handleTagToggle = (tag) => {
    setEventData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleIsFreeToggle = (e) => {
    const checked = e.target.checked;
    const tagsWithoutPricing = eventData.tags.filter((t) => t !== "Free" && t !== "Paid");
    const newTag = checked ? "Free" : "Paid";
    const filteredCustomFields = checked ? eventData.customFields.filter((f) => f.name !== PAYMENT_REF_FIELD_NAME) : eventData.customFields;
    const updatedCustomFields = !checked && !eventData.isExternalRegistration && !filteredCustomFields.some((f) => f.name === PAYMENT_REF_FIELD_NAME)
        ? [...filteredCustomFields, { name: PAYMENT_REF_FIELD_NAME, type: "number", required: true }]
        : filteredCustomFields;

    setEventData((prev) => ({
      ...prev,
      isFree: checked,
      isPaymentRequired: !checked,
      tags: [...tagsWithoutPricing, newTag],
      customFields: updatedCustomFields,
      qrCodeFile: checked ? null : prev.qrCodeFile,
      qrCodePreviewUrl: checked ? "" : prev.qrCodePreviewUrl,
    }));
  };

  const handleIsExternalRegistrationToggle = (e) => {
    const checked = e.target.checked;
    const fieldsWithoutPaymentRef = eventData.customFields.filter((f) => f.name !== PAYMENT_REF_FIELD_NAME);
    const fieldsWithPaymentRef = isPaidEvent && !checked && !fieldsWithoutPaymentRef.some((f) => f.name === PAYMENT_REF_FIELD_NAME)
        ? [...fieldsWithoutPaymentRef, { name: PAYMENT_REF_FIELD_NAME, type: "number", required: true }]
        : fieldsWithoutPaymentRef;

    setEventData((prev) => ({
      ...prev,
      isExternalRegistration: checked,
      registrationUrl: checked ? prev.registrationUrl : "",
      qrCodeFile: checked ? null : prev.qrCodeFile,
      qrCodePreviewUrl: checked ? "" : prev.qrCodePreviewUrl,
      customFields: checked ? fieldsWithoutPaymentRef : fieldsWithPaymentRef,
    }));
  };

  const handleRoundChange = (index, field, value) => {
    const newRounds = [...eventData.rounds];
    newRounds[index][field] = value;
    setEventData((prev) => ({ ...prev, rounds: newRounds }));
  };

  const addRound = () => {
    setEventData((prev) => ({
      ...prev,
      rounds: [...prev.rounds, { title: "", description: "", date: "" }],
    }));
  };

  const removeRound = (index) => {
    if (eventData.rounds.length > 1) {
      setEventData((prev) => ({
        ...prev,
        rounds: prev.rounds.filter((_, i) => i !== index),
      }));
    }
  };

  const handleCustomFieldChange = (index, field, value) => {
    const newFields = [...eventData.customFields];
    newFields[index][field] = value;
    setEventData((prev) => ({ ...prev, customFields: newFields }));
  };

  const addCustomField = () => {
    setEventData((prev) => ({
      ...prev,
      customFields: [...prev.customFields, { name: "", type: "text", required: false }],
    }));
  };

  const removeCustomField = (index) => {
    setEventData((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index),
    }));
  };

  const handleCancelHost = () => {
    if (window.confirm(`Are you sure you want to cancel ${isEditMode ? "editing" : "hosting"}? All unsaved data will be lost.`)) {
      router.replace(parentPathname, { scroll: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus(null);

    // Validation
    if (!eventData.title || !eventData.venue || !eventData.eventStart || !eventData.eventEnd || !eventData.category || eventData.tags.length === 0 || !eventData.posterFile || !eventData.hostedBy){
      setSubmissionStatus("error");
      setIsSubmitting(false);
      return;
    }
      if (new Date(eventData.eventEnd) < new Date(eventData.eventStart)) {
  alert("Event end date cannot be before start date.");
  setIsSubmitting(false);
  return;
}

if (
  eventData.registrationStart &&
  new Date(eventData.registrationStart) > new Date(eventData.eventStart)
) {
  alert("Registration must start before event begins.");
  setIsSubmitting(false);
  return;
}

    try {
      const posterUrl = await uploadToCloudinary(eventData.posterFile, "event-posters");
      let bannerUrl = DEFAULT_BANNER_URL;

if (eventData.bannerFile) {
  bannerUrl = await uploadToCloudinary(
    eventData.bannerFile,
    "event-banners"
  );
}
      
      let qrCodeUrl = eventData.qrCodePreviewUrl;
      if (showQrCodeFields && eventData.qrCodeFile && eventData.qrCodeFile instanceof File) {
        qrCodeUrl = await uploadToCloudinary(eventData.qrCodeFile, "event-qrcodes");
      }

      const eventPayload = {
        title: eventData.title,
        tagline: eventData.tagline,
        description: eventData.description,
        category: eventData.category,
        tags: eventData.tags,
        eventStart: eventData.eventStart,
eventEnd: eventData.eventEnd,
        venue: eventData.venue,
        isOnline: eventData.isOnline,
        poster: posterUrl,
        banner: bannerUrl,
        hostedBy: eventData.hostedBy,
        eligibility: eventData.eligibility,
        isFree: eventData.isFree,
        pricingMode: eventData.pricingMode,
fixedPrice: eventData.fixedPrice,
ticketTypes: eventData.ticketTypes,
        qrCode: qrCodeUrl,
        registrationStart: eventData.registrationStart,
        registrationEnd: eventData.registrationEnd,
        isExternalRegistration: eventData.isExternalRegistration,
        registrationUrl: eventData.registrationUrl,
        customFields: eventData.customFields,
        rounds: eventData.rounds,
        prizes: eventData.prizes,
        teamConfig: eventData.teamConfig,
      };

      if (typeof onEventHosted === "function") {
        await onEventHosted(eventPayload);
      }

      setSubmissionStatus("success");
    } catch (err) {
      console.error("Hosting failed:", err);
      setSubmissionStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionStatus === "success") {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 sm:px-6 lg:px-8 text-center min-h-screen bg-gray-950">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h2 className="text-4xl font-extrabold text-white mb-4">Event {isEditMode ? "updated" : "hosted"} successfully!</h2>
        <p className="text-lg text-gray-300">Your event <span className="font-bold">{eventData.title}</span> is now live.</p>
        <div className="mt-8">
          <button onClick={() => { setSubmissionStatus(null); router.replace(parentPathname, { scroll: true }); }} className="inline-flex items-center bg-purple-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-purple-700 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" /> Go Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans antialiased">
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 relative">
        <button onClick={handleCancelHost} className="absolute top-10 right-4 sm:right-6 lg:right-8 p-2 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors z-10" title="Cancel Hosting and Go Back">
          <X className="w-6 h-6" />
        </button>

        <SectionTitle className="justify-center">{isEditMode ? "Edit Your Event 📝" : "Host Your Event 🚀"}</SectionTitle>
        <p className="text-center text-gray-400 mb-10">Linking this event to your profile: <span className="text-purple-400 font-bold">{eventData.hostedBy || "Syncing profile..."}</span></p>
<div className="flex justify-center mb-10">
  <a
    href={HOST_GUIDE_DOC_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2
           text-gray-400 hover:text-gray-300 transition"
  >
    <BookOpen className="w-5 h-5" />
    Confique Event Host Guide
    <ExternalLink className="w-4 h-4" />
  </a>
</div>
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="bg-gray-900 p-8 rounded-xl shadow-2xl space-y-6 border border-gray-800">
            <SectionTitle icon={ClipboardList}>Basic Details</SectionTitle>
            <InputField label="Event Title" name="title" value={eventData.title} onChange={handleInputChange} placeholder="e.g., Global Tech Summit 2026" required />
            <InputField
  label="Tagline (Short line for card & header)"
  name="tagline"
  value={eventData.tagline}
  onChange={handleInputChange}
  placeholder="e.g., India’s Biggest Tech Battle"
  required
/>

<div className="space-y-2">
  <label className="text-sm font-medium text-gray-400 block">
    Full Event Description
  </label>

  <div className="relative">
    <textarea
      name="description"
      value={eventData.description}
      onChange={handleInputChange}
      placeholder="Write complete details about the event, rules, format, rewards, etc."
      rows={showFullDescription ? 6 : 1}
      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all"
    />

    {eventData.description.length > 80 && (
      <button
        type="button"
        onClick={() => setShowFullDescription(!showFullDescription)}
        className="absolute right-3 bottom-2 text-xs text-purple-400 hover:text-purple-300"
      >
        {showFullDescription ? "See less ▲" : "See more ▼"}
      </button>
    )}
  </div>
</div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <SelectField
    label="Category"
    name="category"
    value={eventData.category}
    onChange={handleInputChange}
    options={categories}
    required
  />

  <InputField
    label="Event Start Date"
    name="eventStart"
    type="date"
    value={eventData.eventStart}
    onChange={handleInputChange}
    required
  />

  <InputField
    label="Event End Date"
    name="eventEnd"
    type="date"
    value={eventData.eventEnd}
    onChange={handleInputChange}
    required
  />
</div>
            <TagSelector selectedTags={eventData.tags} onTagToggle={handleTagToggle} />
          </div>

          <div className="bg-gray-900 p-8 rounded-xl shadow-2xl space-y-6 border border-gray-800">
            <SectionTitle icon={MapPin}>Venue & Images</SectionTitle>
            <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
              <div className="flex items-center space-x-2">
                <input type="checkbox" name="isOnline" id="isOnline" checked={eventData.isOnline} onChange={handleInputChange} className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500" />
                <label htmlFor="isOnline" className="text-sm font-medium text-gray-300">Online Event</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" name="isFree" id="isFree" checked={eventData.isFree} onChange={handleIsFreeToggle} className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500" />
                <label htmlFor="isFree" className="text-sm font-medium text-gray-300">Free Event</label>
              </div>
            </div>
            <InputField label="Venue (Location or URL)" name="venue" value={eventData.venue} onChange={handleInputChange} placeholder={eventData.isOnline ? "e.g., Zoom Link | Discord Server" : "e.g., KIIT Auditorium | Rose Garden, Campus-18"} required />

            {isPaidEvent && (
  <div className="space-y-6 border-l-4 border-yellow-500 pl-4 pt-3">

    {/* Pricing mode */}
    <div className="flex gap-6">
      <label className="flex items-center gap-2">
        <input
          type="radio"
          checked={eventData.pricingMode === "fixed"}
          onChange={() => setEventData(p => ({ ...p, pricingMode: "fixed" }))}
        />
        Fixed price
      </label>

      <label className="flex items-center gap-2">
        <input
          type="radio"
          checked={eventData.pricingMode === "flexible"}
          onChange={() => setEventData(p => ({ ...p, pricingMode: "flexible" }))}
        />
        Multiple ticket types
      </label>
    </div>

    {/* Fixed price */}
    {eventData.pricingMode === "fixed" && (
      <div className="flex items-center gap-4">
        <span className="text-xl text-yellow-300">{CURRENCY_SYMBOL}</span>
        <input
          type="number"
          value={eventData.fixedPrice}
          onChange={e => setEventData(p => ({ ...p, fixedPrice: e.target.value }))}
          placeholder="e.g. 500"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
        />
      </div>
    )}

    {/* Flexible pricing */}
    {eventData.pricingMode === "flexible" && (
      <div className="space-y-4">

        {eventData.ticketTypes.length === 0 && (
          <p className="text-sm text-gray-400">
            No ticket types added yet. Click below to add.
          </p>
        )}

        {eventData.ticketTypes.map((t, i) => (
          <div key={i} className="flex gap-3">
            <input
              placeholder="Ticket name (e.g. Couple, VIP, Kid)"
              value={t.name}
              onChange={e => {
                const list = [...eventData.ticketTypes];
                list[i].name = e.target.value;
                setEventData(p => ({ ...p, ticketTypes: list }));
              }}
              className="flex-1 bg-gray-800 p-2 rounded"
            />

            <input
              type="number"
              placeholder="Price"
              value={t.price}
              onChange={e => {
                const list = [...eventData.ticketTypes];
                list[i].price = Number(e.target.value);
                setEventData(p => ({ ...p, ticketTypes: list }));
              }}
              className="w-28 bg-gray-800 p-2 rounded"
            />

            <button
              type="button"
              onClick={() => setEventData(p => ({
                ...p,
                ticketTypes: p.ticketTypes.filter((_, x) => x !== i)
              }))}
              className="bg-red-600 px-2 rounded"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setEventData(p => ({
            ...p,
            ticketTypes: [...p.ticketTypes, { name: "", price: 0 }]
          }))}
          className="bg-purple-600 px-3 py-1 rounded"
        >
          + Add Ticket Type
        </button>
      </div>
    )}
  </div>
)}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <ImageUploader label="1. Card Poster (Portrait)" ratioTip="Used for listing cards." name="posterFile" file={eventData.posterFile} previewUrl={eventData.posterPreviewUrl} onFileChange={(e) => handleFileChange(e, "posterFile", "posterPreviewUrl")} onRemove={() => handleFileChange({ target: { files: [] } }, "posterFile", "posterPreviewUrl")} />
              <ImageUploader
  label="2. Header Banner (Landscape) (Optional)"
  ratioTip="If not uploaded, a default banner will be used."
  name="bannerFile"
  file={eventData.bannerFile}
  previewUrl={eventData.bannerPreviewUrl}
  onFileChange={(e) => handleFileChange(e, "bannerFile", "bannerPreviewUrl")}
  onRemove={() =>
    handleFileChange({ target: { files: [] } }, "bannerFile", "bannerPreviewUrl")
  }
  required={false}
/>
            </div>
          </div>

          <div className="bg-gray-900 p-8 rounded-xl shadow-2xl space-y-6 border border-gray-800">
            <SectionTitle icon={User}>Organizer & Registration</SectionTitle>
            {/* TEAM SETTINGS */}
<div className="bg-gray-800 p-4 rounded-lg border border-purple-500/40 space-y-4">

<h3 className="text-purple-400 font-bold">
Team Formation
</h3>

<label className="flex items-center gap-2">
<input
 type="checkbox"
 checked={eventData.teamConfig.enabled}
 onChange={e =>
   setEventData(p => ({
     ...p,
     teamConfig: {
       ...p.teamConfig,
       enabled: e.target.checked
     }
   }))
 }
/>
Enable Team Registration
</label>

{eventData.teamConfig.enabled && (

<div>
<label className="text-sm text-gray-300">
Max Members Per Team
</label>

<input
 type="number"
 min="2"
 max="10"
 value={eventData.teamConfig.maxMembers}
 onChange={e =>
   setEventData(p => ({
     ...p,
     teamConfig: {
       ...p.teamConfig,
       maxMembers: Number(e.target.value)
     }
   }))
 }
 className="w-full bg-gray-900 border border-gray-700 rounded p-2"
/>

<p className="text-xs text-gray-400 mt-1">
Example: Enter 4 → each team can have max 4 members
</p>
</div>
)}

</div>

            <InputField label="Hosted By" name="hostedBy" value={eventData.hostedBy} disabled required />
            <InputField label="Eligibility" name="eligibility" value={eventData.eligibility} onChange={handleInputChange} placeholder="e.g., Open to all" required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Registration Start Date" name="registrationStart" type="date" value={eventData.registrationStart} onChange={handleInputChange} />
              <InputField label="Registration End Date" name="registrationEnd" type="date" value={eventData.registrationEnd} onChange={handleInputChange} />
            </div>
            <InputField label="Prizes" name="prizes" value={eventData.prizes} onChange={handleInputChange} placeholder="e.g., Cash" />
          </div>

          <div className="bg-gray-900 p-8 rounded-xl shadow-2xl space-y-6 border border-gray-800">
            <SectionTitle icon={Clock}>Event Stages & Timeline</SectionTitle>
            {eventData.rounds.map((round, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-4 relative">
                <h3 className="text-lg font-bold text-purple-400">Round {index + 1}</h3>
                {eventData.rounds.length > 1 && <button type="button" onClick={() => removeRound(index)} className="absolute top-4 right-4 p-1 rounded-full bg-red-600 text-white"><X className="w-4 h-4" /></button>}
                <InputField label="Title" value={round.title} onChange={(e) => handleRoundChange(index, "title", e.target.value)} required />
                <InputField label="Date" type="date" value={round.date} onChange={(e) => handleRoundChange(index, "date", e.target.value)} required />
                <InputField label="Description" value={round.description} onChange={(e) => handleRoundChange(index, "description", e.target.value)} />
              </div>
            ))}
            <button type="button" onClick={addRound} className="w-full bg-gray-700 text-white py-2 rounded-lg"><Plus className="w-5 h-5 mr-2 inline" /> Add Round</button>
          </div>

          <div className="bg-gray-900 p-8 rounded-xl shadow-2xl space-y-6 border border-gray-800">
            <SectionTitle icon={Menu}>Registration Customization</SectionTitle>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg border border-purple-500/50">
                <input type="checkbox" name="isExternalRegistration" id="isExternalRegistration" checked={eventData.isExternalRegistration} onChange={handleIsExternalRegistrationToggle} className="w-5 h-5" />
                <label htmlFor="isExternalRegistration" className="text-purple-400 font-bold"><ExternalLink className="w-5 h-5 mr-2 inline" /> External Registration</label>
              </div>
              {eventData.isExternalRegistration ? (
                <InputField label="URL" name="registrationUrl" value={eventData.registrationUrl} onChange={handleInputChange} type="url" required />
              ) : (
                <>
                  {showQrCodeFields && (
                    <div className="p-4 bg-yellow-900/30 border border-yellow-500/50 space-y-4 rounded-lg">
                      <SectionTitle icon={QrCode}>QR Code Payment</SectionTitle>
                      <ImageUploader label="Upload QR" name="qrCodeFile" file={eventData.qrCodeFile} previewUrl={eventData.qrCodePreviewUrl} onFileChange={(e) => handleFileChange(e, "qrCodeFile", "qrCodePreviewUrl")} onRemove={() => handleFileChange({ target: { files: [] } }, "qrCodeFile", "qrCodePreviewUrl")} />
                    </div>
                  )}
                  {eventData.customFields.map((field, index) => (
                    <div key={index} className="p-4 rounded-lg border bg-gray-800 border-gray-700 space-y-3 relative">
                      {field.name !== PAYMENT_REF_FIELD_NAME && <button type="button" onClick={() => removeCustomField(index)} className="absolute top-4 right-4 p-1 rounded-full bg-red-600 text-white"><X className="w-4 h-4" /></button>}
                      <InputField label="Field Label" value={field.name} onChange={(e) => handleCustomFieldChange(index, "name", e.target.value)} required disabled={field.name === PAYMENT_REF_FIELD_NAME} />
                      <div className="grid grid-cols-2 gap-4">
                        <SelectField label="Type" value={field.type} onChange={(e) => handleCustomFieldChange(index, "type", e.target.value)} options={[{name:"text"},{name:"number"},{name:"email"},{name:"date"},{name:"checkbox"}]} required disabled={field.name === PAYMENT_REF_FIELD_NAME} />
                        <div className="pt-8 flex items-center space-x-2">
                          <input type="checkbox" checked={field.required} onChange={(e) => handleCustomFieldChange(index, "required", e.target.checked)} disabled={field.name === PAYMENT_REF_FIELD_NAME} />
                          <label>Required</label>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addCustomField} className="w-full bg-gray-700 text-white py-2 rounded-lg"><Plus className="w-5 h-5 mr-2 inline" /> Add Field</button>
                </>
              )}
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-purple-600 text-white font-extrabold text-lg rounded-xl disabled:bg-gray-600 shadow-xl shadow-purple-500/20 transition-all hover:bg-purple-500">
            {isSubmitting ? "Finalizing Event..." : (isEditMode ? "Save Changes" : "Host Event")}
          </button>
          
          {(submissionStatus && submissionStatus !== "success") && (
            <p className="text-red-500 text-center mt-4 font-bold">
              {submissionStatus === "error" ? "Please fill all required fields and upload images." :
               submissionStatus === "error_url" ? "Please provide a valid Registration URL." :
               submissionStatus === "error_paid_amount" ? "Payment Amount is required." :
               "QR Code Image is required."}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default HostEventPage;