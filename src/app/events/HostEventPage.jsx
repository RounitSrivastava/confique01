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
  <h2 className={`text-2xl font-bold text-gray-900 dark:text-text-1 mb-6 border-b border-gray-200 dark:border-border-1 pb-3 flex items-center ${className}`}>
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
    <label className="text-sm font-medium text-gray-500 dark:text-text-3 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      name={name}
      type={type}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={`w-full px-4 py-2 bg-gray-50 dark:bg-bg-3 border border-gray-200 dark:border-border-1 border border-gray-200 dark:border-border-1 rounded-lg text-gray-900 dark:text-text-1 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${disabled ? "opacity-50 cursor-not-allowed bg-white dark:bg-bg-1 border border-gray-200 dark:border-border-1" : ""}`}
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
    <label className="text-sm font-medium text-gray-500 dark:text-text-3 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>

    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={`w-full px-4 py-2 bg-gray-50 dark:bg-bg-3 border border-gray-200 dark:border-border-1 border border-gray-200 dark:border-border-1 rounded-lg text-gray-900 dark:text-text-1 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors cursor-pointer ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <option value="">Select</option>

      {options.map((option) => (
        <option
          key={option.name || option}
          value={option.name || option}
          className="bg-gray-50 dark:bg-bg-3 border border-gray-200 dark:border-border-1 text-gray-900 dark:text-text-1"
        >
          {option.name || option}
        </option>
      ))}
    </select>
  </div>
);

const TagSelector = ({ selectedTags, onTagToggle }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-500 dark:text-text-3 block">Event Tags</label>
    <div className="flex flex-wrap gap-2">
      {TagOptions.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onTagToggle(tag)}
          className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-200 ${
            selectedTags.includes(tag)
              ? "bg-purple-500 border-purple-500 text-gray-900 dark:text-text-1 shadow-md shadow-purple-500/30"
              : "bg-gray-50 dark:bg-bg-3 border border-gray-200 dark:border-border-1 border-gray-200 dark:border-border-1 text-gray-600 dark:text-text-2 hover:bg-gray-700"
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
      <label className="text-sm font-medium text-gray-500 dark:text-text-3 block">
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>
      {ratioTip && (
        <p className="text-xs text-purple-300 bg-gray-50 dark:bg-bg-3 border border-gray-200 dark:border-border-1 p-2 rounded-lg">
          {ratioTip}
        </p>
      )}

      <input
  type="file"
  accept="image/*"
  ref={fileInputRef}
  onChange={onFileChange}
  style={{ display: "none" }}
  name={name}
/>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-full py-3 bg-purple-500 rounded-lg text-white font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2 shadow-md shadow-purple-500/20"
      >
        <Upload className="w-5 h-5 text-white" />
        <span>{file instanceof File ? file.name : (file ? "Image Uploaded" : "Click to Upload Image")}</span>
      </button>

      {previewUrl && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-bg-3 border border-gray-200 dark:border-border-1 rounded-lg flex items-center space-x-4">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-20 h-28 object-cover rounded-md border border-purple-500"
          />
          <div className="text-sm text-gray-500 dark:text-text-3">
            <p className="text-gray-900 dark:text-text-1 font-medium line-clamp-1">{file instanceof File ? file.name : "Current Event Image"}</p>
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
  const PAYMENT_SS_FIELD_NAME = "Payment Screenshot";
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
    eventStart: formatDate(initialData?.eventStart || initialData?.date),
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
    groupLink: initialData?.groupLink || "",
    rounds: initialData?.rounds || [
      { title: "Registration Opens", description: "Sign up and form your teams.", date: "" },
    ],
    isPaymentRequired: initialData?.isPaymentRequired || false, // 🔥 NEW pricing system
pricingMode: initialData?.pricingMode || "fixed",   // fixed | flexible
fixedPrice: initialData?.fixedPrice || "",
ticketTypes: initialData?.ticketTypes || [],       // host will create their own
paymentCurrency: CURRENCY_CODE,
paymentMethod: initialData?.paymentMethod || "qr", // qr | gateway | link
    paymentLink: initialData?.paymentLink || "",
    qrCodePreviewUrl: initialData?.qrCode || "",
    qrCodeFile: initialData?.qrCode || null,
    isExternalRegistration: initialData?.isExternalRegistration || false,
    registrationUrl: initialData?.registrationUrl || "",
    requirePaymentScreenshot: initialData?.requirePaymentScreenshot || false,
    customFields: initialData?.customFields || [
  { name: "Team Leader Name", type: "text", required: true, options: [] },
  { name: "Team Leader Email", type: "email", required: true, options: [] },
],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
const [aiLoading, setAiLoading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
useEffect(() => {
  setEventData(prev => {
    let updatedFields = [...prev.customFields];

    const refExists = updatedFields.some(
      f => f.name === PAYMENT_REF_FIELD_NAME
    );

    const ssExists = updatedFields.some(
      f => f.name === PAYMENT_SS_FIELD_NAME
    );

    // Paid + QR + Internal Registration
    if (
      !prev.isFree &&
      prev.paymentMethod === "qr" &&
      !prev.isExternalRegistration
    ) {

      // Add Payment Ref
      if (!refExists) {
        updatedFields.push({
          name: PAYMENT_REF_FIELD_NAME,
          type: "number",
          required: true,
          options: []
        });
      }

      // Add Screenshot if enabled
      if (prev.requirePaymentScreenshot && !ssExists) {
        updatedFields.push({
          name: PAYMENT_SS_FIELD_NAME,
          type: "file",
          required: true,
          options: []
        });
      }

      // Remove Screenshot if toggle off
      if (!prev.requirePaymentScreenshot && ssExists) {
        updatedFields = updatedFields.filter(
          f => f.name !== PAYMENT_SS_FIELD_NAME
        );
      }

      return { ...prev, customFields: updatedFields };
    }

    // If not QR or not paid → remove both
    updatedFields = updatedFields.filter(
      f =>
        f.name !== PAYMENT_REF_FIELD_NAME &&
        f.name !== PAYMENT_SS_FIELD_NAME
    );

    return { ...prev, customFields: updatedFields };

  });
}, [
  eventData.paymentMethod,
  eventData.isFree,
  eventData.isExternalRegistration,
  eventData.requirePaymentScreenshot
]);

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
      eventStart: formatDate(initialData.eventStart || initialData.date),
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
      groupLink: initialData.groupLink || "",
      rounds: initialData.rounds || [],
      pricingMode: initialData.pricingMode || "fixed",
      fixedPrice: initialData.fixedPrice || "",
      ticketTypes: initialData.ticketTypes || [],
      paymentMethod: initialData.paymentMethod || "qr",
      paymentLink: initialData.paymentLink || "",
      qrCodePreviewUrl: initialData.qrCode || "",
      qrCodeFile: initialData.qrCode || null,
      isExternalRegistration: initialData.isExternalRegistration || false,
      registrationUrl: initialData.registrationUrl || "",
      customFields: (initialData.customFields || []).map(f => ({
  ...f,
  options: f.options || []
})),
    });
  }
}, [initialData?.id || initialData?._id]);

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
  const showQrCodeFields =
  isPaidEvent &&
  eventData.paymentMethod === "qr" &&
  !eventData.isExternalRegistration;

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
    const updatedCustomFields =
  !checked &&
  eventData.paymentMethod === "qr" &&
  !eventData.isExternalRegistration &&
  !filteredCustomFields.some((f) => f.name === PAYMENT_REF_FIELD_NAME)
    ? [...filteredCustomFields, { name: PAYMENT_REF_FIELD_NAME, type: "number", required: true, options: [] }]
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
        ? [...fieldsWithoutPaymentRef, { name: PAYMENT_REF_FIELD_NAME, type: "number", required: true, options: [] }]
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

  if (field === "type") {
    newFields[index].type = value;

    // If switching to checkbox → ensure options array exists
   if (value === "checkbox") {
  newFields[index].options = newFields[index].options || [];
  newFields[index].selectionType = "multiple"; // default
}

    // If switching away from checkbox → clear options
    if (value !== "checkbox") {
      newFields[index].options = [];
    }
  } else {
    newFields[index][field] = value;
  }

  setEventData(prev => ({
    ...prev,
    customFields: newFields
  }));
};

  const removeCustomField = (index) => {
    setEventData((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index),
    }));
  };
const addCustomField = () => {
  setEventData(prev => ({
    ...prev,
    customFields: [
      ...prev.customFields,
      {
        name: "",
        type: "text",
        required: false,
        options: [],
        selectionType: "multiple" // default
      }
    ]
  }));
};
  const handleCancelHost = () => {
    if (window.confirm(`Are you sure you want to cancel ${isEditMode ? "editing" : "hosting"}? All unsaved data will be lost.`)) {
      router.replace(parentPathname, { scroll: true });
    }
  };

   const handleDocumentUpload = async (e) => {

  const file = e.target.files[0];

  if (!file) return;

  try {

    setAiLoading(true);

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch("/api/ai-event-from-doc", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    console.log(data);

    setEventData(prev => ({

      ...prev,

      title: data.title || "",
      tagline: data.tagline || "",
      description: data.description || "",

      venue: data.venue || "",

      category: data.category || "",

      eligibility: data.eligibility || "",

      prizes: data.prizes || "",

      eventStart: data.eventStart || "",
      eventEnd: data.eventEnd || "",

      registrationStart: data.registrationStart || "",
      registrationEnd: data.registrationEnd || "",
      isFree:
  typeof data.isFree === "boolean"
    ? data.isFree
    : prev.isFree,

pricingMode:
  data.pricingMode
    ? data.pricingMode.trim()
    : prev.pricingMode,

fixedPrice:
  data.fixedPrice !== undefined &&
  data.fixedPrice !== null
    ? String(data.fixedPrice)
    : prev.fixedPrice,

ticketTypes:
  Array.isArray(data.ticketTypes)
    ? data.ticketTypes
    : prev.ticketTypes,

      tags: Array.isArray(data.tags)
        ? data.tags
        : prev.tags,

      rounds: Array.isArray(data.rounds)
        ? data.rounds
        : prev.rounds,

      customFields: Array.isArray(data.customFields)
        ? data.customFields
        : prev.customFields,

      teamConfig:
        typeof data.teamConfig === "object" &&
        data.teamConfig !== null
          ? data.teamConfig
          : prev.teamConfig

    }));

  } catch (err) {

    console.log(err);

    alert("Document AI extraction failed");

  } finally {

    setAiLoading(false);

  }
};

const generateWithAI = async () => {

  try {

    setAiLoading(true);

    const response = await fetch("/api/ai-event", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        prompt: aiPrompt
      })

    });

    const data = await response.json();

    console.log(data);

    setEventData(prev => ({

      ...prev,

      title: data.title || "",
      tagline: data.tagline || "",
      description: data.description || "",

      venue: data.venue || "",

      category: data.category || "",

      eligibility: data.eligibility || "",

      prizes: data.prizes || "",

      eventStart: data.eventStart || "",
      eventEnd: data.eventEnd || "",

      registrationStart: data.registrationStart || "",
registrationEnd: data.registrationEnd || "",

// ✅ PRICING
isFree:
  typeof data.isFree === "boolean"
    ? data.isFree
    : prev.isFree,

pricingMode:
  data.pricingMode
    ? data.pricingMode.trim()
    : prev.pricingMode,

fixedPrice:
  data.fixedPrice !== undefined &&
  data.fixedPrice !== null
    ? String(data.fixedPrice)
    : prev.fixedPrice,

ticketTypes:
  Array.isArray(data.ticketTypes)
    ? data.ticketTypes
    : prev.ticketTypes,

tags: Array.isArray(data.tags)
  ? data.tags
  : prev.tags,

      rounds: Array.isArray(data.rounds)
  ? data.rounds
  : prev.rounds,

      teamConfig:
  typeof data.teamConfig === "object" &&
  data.teamConfig !== null
    ? data.teamConfig
    : prev.teamConfig,

customFields: Array.isArray(data.customFields)
  ? data.customFields
  : prev.customFields

    }));

  } catch (err) {

    console.log(err);

    alert("AI generation failed");

  } finally {

    setAiLoading(false);

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
      let bannerUrl = posterUrl;
      
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
        requirePaymentScreenshot: eventData.requirePaymentScreenshot,
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
paymentMethod: eventData.paymentMethod,
        paymentLink: eventData.paymentLink,
        qrCode: qrCodeUrl,
        registrationStart: eventData.registrationStart,
        registrationEnd: eventData.registrationEnd,
        isExternalRegistration: eventData.isExternalRegistration,
        registrationUrl: eventData.registrationUrl,
        customFields: eventData.customFields,
        rounds: eventData.rounds,
        prizes: eventData.prizes,
        groupLink: eventData.groupLink,
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
      <div className="max-w-4xl mx-auto py-20 px-4 sm:px-6 lg:px-8 text-center min-h-screen bg-gray-50 dark:bg-bg-1">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-text-1 mb-4">Event {isEditMode ? "updated" : "hosted"} successfully!</h2>
        <p className="text-lg text-gray-600 dark:text-text-2">Your event <span className="font-bold">{eventData.title}</span> is now live.</p>
        <div className="mt-8">
          <button onClick={() => { setSubmissionStatus(null); router.replace(parentPathname, { scroll: true }); }} className="inline-flex items-center bg-purple-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-purple-600 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" /> Go Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-bg-1 text-gray-900 dark:text-text-1 font-sans antialiased">
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 relative">
        <button onClick={handleCancelHost} className="absolute top-10 right-4 sm:right-6 lg:right-8 p-2 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors z-10" title="Cancel Hosting and Go Back">
          <X className="w-6 h-6" />
        </button>

        <SectionTitle className="justify-center">{isEditMode ? "Edit Your Event 📝" : "Host Your Event 🚀"}</SectionTitle>
        <p className="text-center text-gray-500 dark:text-text-3 mb-10">Linking this event to your profile: <span className="text-purple-400 font-bold">{eventData.hostedBy || "Syncing profile..."}</span></p>
<div className="flex justify-center mb-10">
  <a
    href={HOST_GUIDE_DOC_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2
           text-gray-500 dark:text-text-3 hover:text-gray-600 dark:text-text-2 transition"
  >
    <BookOpen className="w-5 h-5" />
    Confique Event Host Guide
    <ExternalLink className="w-4 h-4" />
  </a>
</div>
<div className="bg-white dark:bg-bg-1 border border-gray-200 dark:border-border-1 p-6 rounded-xl mb-10 border border-purple-500">

  <h2 className="text-3xl font-bold text-gray-900 dark:text-text-1 mb-4">
    ✨ Generate Event Using AI
  </h2>

  <p className="text-gray-500 dark:text-text-3 mb-4">
    Describe your event idea and AI will auto-fill the form.
  </p>

  <textarea
    value={aiPrompt}
    onChange={(e) => setAiPrompt(e.target.value)}
    placeholder="Example: Create a 2-day AI hackathon for 300 students with workshops, sponsors, prizes, and team participation."
    className="w-full h-36 p-4 bg-gray-50 dark:bg-bg-3 border border-gray-200 dark:border-border-1 border border-gray-200 dark:border-border-1 rounded-lg text-gray-900 dark:text-text-1"
  />

{/* pdf input area  */}
<input
  type="file"
  accept=".pdf,.doc,.docx,.txt"
  onChange={handleDocumentUpload}
  className="mt-4 block w-full text-sm text-gray-600 dark:text-text-2"
/>
  <button
    type="button"
    onClick={generateWithAI}
    disabled={aiLoading}
    className="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-bold"
  >
    {aiLoading ? "Generating..." : "Generate Event"}
  </button>

</div>
        <form 
          onSubmit={handleSubmit} 
          className="space-y-10"
          onKeyDown={(e) => {
            // Prevent accidental form submission when pressing Enter in text inputs
            if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && e.target.type !== "submit") {
              e.preventDefault();
            }
          }}
        >
          <div className="bg-white dark:bg-bg-1 border border-gray-200 dark:border-border-1 p-8 rounded-xl shadow-2xl space-y-6 border border-gray-200 dark:border-border-1">
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
  <label className="text-sm font-medium text-gray-500 dark:text-text-3 block">
    Full Event Description
  </label>

  <div className="relative">
    <textarea
      name="description"
      value={eventData.description}
      onChange={handleInputChange}
      placeholder="Write complete details about the event, rules, format, rewards, etc."
      rows={showFullDescription ? 6 : 1}
      className="w-full px-4 py-2 bg-gray-50 dark:bg-bg-3 border border-gray-200 dark:border-border-1 border border-gray-200 dark:border-border-1 rounded-lg text-gray-900 dark:text-text-1 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all"
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

          <div className="bg-white dark:bg-bg-1 border border-gray-200 dark:border-border-1 p-8 rounded-xl shadow-2xl space-y-6 border border-gray-200 dark:border-border-1">
            <SectionTitle icon={MapPin}>Venue & Images</SectionTitle>
            <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
              <div className="flex items-center space-x-2">
                <input type="checkbox" name="isOnline" id="isOnline" checked={eventData.isOnline} onChange={handleInputChange} className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500" />
                <label htmlFor="isOnline" className="text-sm font-medium text-gray-600 dark:text-text-2">Online Event</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" name="isFree" id="isFree" checked={eventData.isFree} onChange={handleIsFreeToggle} className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500" />
                <label htmlFor="isFree" className="text-sm font-medium text-gray-600 dark:text-text-2">Free Event</label>
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
  name="pricingMode"
  checked={eventData.pricingMode === "fixed"}
  onChange={() => setEventData(p => ({ ...p, pricingMode: "fixed" }))}
 />
        Fixed price
      </label>

      <label className="flex items-center gap-2">
        <input
  type="radio"
  name="pricingMode"
  checked={eventData.pricingMode === "flexible"}
  onChange={() => setEventData(p => ({ ...p, pricingMode: "flexible" }))}
 />
        Multiple ticket types
      </label>
    </div>
<div className="flex gap-6 mt-4">
  <label className="flex items-center gap-2">
    <input
  type="radio"
  name="paymentMethod"
  checked={eventData.paymentMethod === "qr"}
  onChange={() =>
    setEventData(p => ({ ...p, paymentMethod: "qr" }))
  }
/>
    QR Payment
  </label>

  <label className="flex items-center gap-2">
    <input
  type="radio"
  name="paymentMethod"
  checked={eventData.paymentMethod === "gateway"}
  onChange={() =>
    setEventData(p => ({ ...p, paymentMethod: "gateway" }))
  }
/>
    Online Gateway
  </label>

  <label className="flex items-center gap-2">
    <input
      type="radio"
      name="paymentMethod"
      checked={eventData.paymentMethod === "link"}
      onChange={() =>
        setEventData(p => ({ ...p, paymentMethod: "link" }))
      }
    />
    Payment Link
  </label>
</div>

{eventData.paymentMethod === "link" && (
  <div className="mt-4">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
      Payment Gateway Link (e.g. Razorpay, Stripe)
    </label>
    <input
      type="url"
      name="paymentLink"
      value={eventData.paymentLink}
      onChange={handleInputChange}
      placeholder="https://rzp.io/l/..."
      className="w-full mt-1 p-2 rounded-lg bg-gray-50 dark:bg-bg-1 border border-gray-300 dark:border-border-1 focus:ring-purple-500 text-gray-900 dark:text-gray-100"
    />
  </div>
)}

    {/* Fixed price */}
    {eventData.pricingMode === "fixed" && (
      <div className="flex items-center gap-4">
        <span className="text-xl text-yellow-300">{CURRENCY_SYMBOL}</span>
        <input
          type="number"
          value={eventData.fixedPrice || ""}
          onChange={e => setEventData(p => ({ ...p, fixedPrice: e.target.value }))}
          placeholder="e.g. 500"
          className="w-full px-4 py-2 bg-gray-50 dark:bg-bg-3 border border-gray-200 dark:border-border-1 border border-gray-200 dark:border-border-1 rounded-lg"
        />
      </div>
    )}

    {/* Flexible pricing */}
    {eventData.pricingMode === "flexible" && (
      <div className="space-y-4">

        {eventData.ticketTypes.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-text-3">
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
              className="flex-1 bg-gray-50 dark:bg-bg-3 border border-gray-200 dark:border-border-1 p-2 rounded"
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
              className="w-28 bg-gray-50 dark:bg-bg-3 border border-gray-200 dark:border-border-1 p-2 rounded"
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
          className="bg-purple-500 px-3 py-1 rounded"
        >
          + Add Ticket Type
        </button>
      </div>
    )}
  </div>
)}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <ImageUploader label="1. Event Poster (16:9 Fixed Ratio)" ratioTip="This single image will be used everywhere across the platform without being cropped." name="posterFile" file={eventData.posterFile} previewUrl={eventData.posterPreviewUrl} onFileChange={(e) => handleFileChange(e, "posterFile", "posterPreviewUrl")} onRemove={() => handleFileChange({ target: { files: [] } }, "posterFile", "posterPreviewUrl")} />
              <ImageUploader
                label="2. Header Banner (Optional)"
                ratioTip="Used as the background for the event details page. (1920x480 recommended)"
                name="bannerFile"
                file={eventData.bannerFile}
                previewUrl={eventData.bannerPreviewUrl}
                onFileChange={(e) => handleFileChange(e, "bannerFile", "bannerPreviewUrl")}
                onRemove={() => handleFileChange({ target: { files: [] } }, "bannerFile", "bannerPreviewUrl")}
                required={false}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-bg-1 border border-gray-200 dark:border-border-1 p-8 rounded-xl shadow-2xl space-y-6 border border-gray-200 dark:border-border-1">
            <SectionTitle icon={User}>Organizer & Registration</SectionTitle>
            {/* TEAM SETTINGS */}
<div className="bg-gray-50 dark:bg-bg-3 border border-gray-200 dark:border-border-1 p-4 rounded-lg border border-purple-500/40 space-y-4">

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
<label className="text-sm text-gray-600 dark:text-text-2">
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
 className="w-full bg-white dark:bg-bg-1 border border-gray-200 dark:border-border-1 border border-gray-200 dark:border-border-1 rounded p-2"
/>

<p className="text-xs text-gray-500 dark:text-text-3 mt-1">
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
            <InputField
  label="WhatsApp / Community Group Link (Optional)"
  name="groupLink"
  type="url"
  value={eventData.groupLink}
  onChange={handleInputChange}
  placeholder="https://chat.whatsapp.com/..."
/>
          </div>

          <div className="bg-white dark:bg-bg-1 border border-gray-200 dark:border-border-1 p-8 rounded-xl shadow-2xl space-y-6 border border-gray-200 dark:border-border-1">
            <SectionTitle icon={Clock}>Event Stages & Timeline</SectionTitle>
            {eventData.rounds.map((round, index) => (
              <div key={index} className="bg-gray-50 dark:bg-bg-3 border border-gray-200 dark:border-border-1 p-4 rounded-lg border border-gray-200 dark:border-border-1 space-y-4 relative">
                <h3 className="text-lg font-bold text-purple-400">Round {index + 1}</h3>
                {eventData.rounds.length > 1 && <button type="button" onClick={() => removeRound(index)} className="absolute top-4 right-4 p-1 rounded-full bg-red-600 text-gray-900 dark:text-text-1"><X className="w-4 h-4" /></button>}
                <InputField label="Title" value={round.title} onChange={(e) => handleRoundChange(index, "title", e.target.value)} required />
                <InputField label="Date" type="date" value={round.date} onChange={(e) => handleRoundChange(index, "date", e.target.value)} required />
                <InputField label="Description" value={round.description} onChange={(e) => handleRoundChange(index, "description", e.target.value)} />
              </div>
            ))}
            <button type="button" onClick={addRound} className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-text-2 hover:bg-gray-300 dark:hover:bg-gray-600 py-2 rounded-lg font-medium"><Plus className="w-5 h-5 mr-2 inline" /> Add Round</button>
          </div>

          <div className="bg-white dark:bg-bg-1 border border-gray-200 dark:border-border-1 p-8 rounded-xl shadow-2xl space-y-6 border border-gray-200 dark:border-border-1">
            <SectionTitle icon={Menu}>Registration Customization</SectionTitle>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-bg-3 border border-gray-200 dark:border-border-1 rounded-lg border border-purple-500/50">
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
                        <div className="flex items-center gap-2 mt-4">
  <input
    type="checkbox"
    checked={eventData.requirePaymentScreenshot}
    onChange={(e) =>
      setEventData(prev => ({
        ...prev,
        requirePaymentScreenshot: e.target.checked
      }))
    }
  />
  <label className="text-sm text-yellow-200">
    Require Payment Screenshot from participants
  </label>
</div>
                    </div>
                  )}
                  {eventData.customFields.map((field, index) => (
                    <div key={index} className="p-4 rounded-lg border bg-gray-50 dark:bg-bg-3 border border-gray-200 dark:border-border-1 border-gray-200 dark:border-border-1 space-y-3 relative">
                      {field.name !== PAYMENT_REF_FIELD_NAME && <button type="button" onClick={() => removeCustomField(index)} className="absolute top-4 right-4 p-1 rounded-full bg-red-600 text-gray-900 dark:text-text-1"><X className="w-4 h-4" /></button>}
                     <InputField
  label="Field Label"
  value={field.name}
  onChange={(e) =>
    handleCustomFieldChange(index, "name", e.target.value)
  }
  required
  disabled={field.name === PAYMENT_REF_FIELD_NAME}
/>

<div className="grid grid-cols-2 gap-4">
  <SelectField
    label="Type"
    value={field.type}
    onChange={(e) =>
      handleCustomFieldChange(index, "type", e.target.value)
    }
    options={[
  { name: "text" },
  { name: "number" },
  { name: "email" },
  { name: "date" },
  { name: "checkbox" },
  { name: "file" } // ADD THIS
]}
    required
    disabled={field.name === PAYMENT_REF_FIELD_NAME}
  />

  <div className="pt-8 flex items-center space-x-2">
    <input
      type="checkbox"
      checked={field.required}
      onChange={(e) =>
        handleCustomFieldChange(index, "required", e.target.checked)
      }
      disabled={field.name === PAYMENT_REF_FIELD_NAME}
    />
    <label>Required</label>
  </div>
</div>

{/* ✅ MOVE CHECKBOX OPTIONS OUTSIDE GRID */}
{field.type === "checkbox" && (
  <>
    {/* Single / Multiple Selector */}
    <div className="flex gap-6 mb-3">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="radio"
          name={`selection-${index}`}
          checked={field.selectionType !== "multiple"}
          onChange={() => {
            const updated = [...eventData.customFields];
            updated[index].selectionType = "single";
            setEventData(p => ({ ...p, customFields: updated }));
          }}
        />
        Single Select
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="radio"
          name={`selection-${index}`}
          checked={field.selectionType === "multiple"}
          onChange={() => {
            const updated = [...eventData.customFields];
            updated[index].selectionType = "multiple";
            setEventData(p => ({ ...p, customFields: updated }));
          }}
        />
        Multiple Select
      </label>
    </div>

    {/* Checkbox Options */}
    <div className="space-y-2 mt-4">
      <label className="text-sm text-gray-500 dark:text-text-3">
        Checkbox Options
      </label>

      {field.options?.map((opt, optIndex) => (
        <div key={optIndex} className="flex gap-2">
          <input
            type="text"
            value={opt}
            onChange={(e) => {
              const updated = [...eventData.customFields];
              updated[index].options[optIndex] = e.target.value;
              setEventData(p => ({ ...p, customFields: updated }));
            }}
            className="flex-1 bg-white dark:bg-bg-1 border border-gray-200 dark:border-border-1 border border-gray-200 dark:border-border-1 rounded p-2"
            placeholder="Option label"
          />
<button
  type="button"
  onClick={() => {
    const updated = [...eventData.customFields];
    updated[index].options =
      updated[index].options.filter((_, i) => i !== optIndex);
    setEventData(p => ({ ...p, customFields: updated }));
  }}
  className="w-8 h-8 flex items-center justify-center rounded-full transition"
>
  <X className="w-4 h-4 text-gray-900 dark:text-text-1" />
</button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => {
          const updated = [...eventData.customFields];
          updated[index].options = [...(updated[index].options || []), ""];
          setEventData(p => ({ ...p, customFields: updated }));
        }}
        className="bg-purple-500 px-3 py-1 rounded text-sm"
      >
        + Add Option
      </button>
    </div>
  </>
)}
       
                      </div>
                  ))}
                  <button type="button" onClick={addCustomField} className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-text-2 hover:bg-gray-300 dark:hover:bg-gray-600 py-2 rounded-lg font-medium"><Plus className="w-5 h-5 mr-2 inline" /> Add Field</button>
                </>
              )}
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-purple-500 text-white font-extrabold text-lg rounded-xl disabled:bg-gray-300 disabled:dark:bg-gray-700 shadow-xl shadow-purple-500/20 transition-all hover:bg-purple-500">
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
