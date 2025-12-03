// components/HostEventPage.jsx
"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation"; 
import {
    Zap, Code, Shirt, Medal, Compass, BookOpen, Clock, MapPin,
    Calendar, User, Plus, X, ClipboardList, Gift, ChevronDown, ChevronUp, CheckCircle, ArrowLeft, MessageSquare, Menu, Upload, ExternalLink
} from "lucide-react";

// Re-using the categories
const categories = [
    { name: "Tech", icon: Code },
    { name: "Fashion", icon: Shirt },
    { name: "Competition", icon: Medal },
    { name: "Cultural", icon: Compass },
    { name: "Seminar", icon: BookOpen },
    { name: "Workshop", icon: Clock },
    { name: "Others", icon: Zap },
];

const TagOptions = ["Team (4)", "Team (3)", "Team (2)", "Solo", "Free", "Paid"];

const SectionTitle = ({ children, icon: Icon, className = "" }) => (
    <h2 className={`text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-3 flex items-center ${className}`}>
        {Icon && <Icon className="w-6 h-6 mr-3 text-purple-400" />}
        {children}
    </h2>
);

const InputField = ({ label, type = "text", value, onChange, placeholder, required = false, className = "" }) => (
    <div className={`space-y-2 ${className}`}>
        <label className="text-sm font-medium text-gray-400 block">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
        />
    </div>
);

const SelectField = ({ label, value, onChange, options, required = false }) => (
    <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400 block">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            value={value}
            onChange={onChange}
            required={required}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors cursor-pointer"
        >
            <option value="" disabled>Select {label}</option>
            {options.map((option) => (
                <option key={option.name || option} value={option.name || option} className="bg-gray-800 text-white">
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
                    className={`
                        px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-200
                        ${selectedTags.includes(tag)
                            ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/30"
                            : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"}
                    `}
                >
                    {tag}
                </button>
            ))}
        </div>
    </div>
);

// Reusable Image Upload Component
const ImageUploader = ({ label, ratioTip, name, file, previewUrl, onFileChange, onRemove }) => {
    const fileInputRef = useRef(null);
    const required = !file;

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 block">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <p className="text-xs text-purple-300 bg-gray-800 p-2 rounded-lg">{ratioTip}</p>

            {/* Hidden file input */}
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={onFileChange}
                required={required}
                style={{ display: 'none' }}
                name={name}
            />

            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
            >
                <Upload className="w-5 h-5 text-purple-400" />
                <span>{file ? file.name : "Click to Upload Image"}</span>
            </button>
            
            {/* Image Preview Area */}
            {previewUrl && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg flex items-center space-x-4">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-20 h-28 object-cover rounded-md border border-purple-500"
                    />
                    <div className="text-sm text-gray-400">
                        <p className="text-white font-medium">{file?.name}</p>
                        <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
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


const HostEventPage = ({ parentPathname }) => { 
    const router = useRouter(); 

    const [eventData, setEventData] = useState({
        title: "",
        venue: "",
        date: "", 
        // Card Poster (e.g., 4:3)
        posterPreviewUrl: "", 
        posterFile: null, 
        // Header Banner (e.g., 4:1)
        bannerPreviewUrl: "", 
        bannerFile: null, 
        tags: [],
        category: "",
        tagline: "",
        hostedBy: "",
        eligibility: "",
        isOnline: false,
        isFree: false,
        registrationStart: "",
        registrationEnd: "",
        prizes: "",
        rounds: [
            { title: "Registration Opens", description: "Sign up and form your teams.", date: "" },
        ],
        // --- NEW EXTERNAL REGISTRATION STATE ---
        isExternalRegistration: false,
        registrationUrl: "",
        // ---------------------------------------
        customFields: [
            { name: "Team Leader Name", type: "text", required: true },
            { name: "Team Leader Email", type: "email", required: true },
        ]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState(null); 

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEventData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };
    
    // --- Centralized Image Handling Function ---
    const handleFileChange = (e, fileKey, previewKey) => {
        const file = e.target.files[0];
        if (file) {
            // Revoke previous URL to prevent memory leaks
            if (eventData[previewKey]) {
                URL.revokeObjectURL(eventData[previewKey]);
            }
            const previewUrl = URL.createObjectURL(file);
            setEventData((prev) => ({
                ...prev,
                [fileKey]: file,
                [previewKey]: previewUrl,
            }));
        } else {
            if (eventData[previewKey]) {
                URL.revokeObjectURL(eventData[previewKey]);
            }
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
    
    // --- Rounds Logic omitted for brevity (no changes) ---
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
    
    // --- Custom Fields Logic omitted for brevity (no changes) ---
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
    
    // --- Cancel Handler ---
    const handleCancelHost = () => {
        if (window.confirm("Are you sure you want to cancel hosting this event? All unsaved data will be lost.")) {
            router.replace(parentPathname, { scroll: true }); 
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmissionStatus(null);

        // --- Core Validation: Check for required core fields and both images ---
        if (!eventData.title || !eventData.venue || !eventData.date || !eventData.category || eventData.tags.length === 0 || !eventData.posterFile || !eventData.bannerFile) {
            console.error("Form validation failed. Please fill all required core fields and upload BOTH images.");
            setSubmissionStatus('error');
            setIsSubmitting(false);
            return;
        }

        // --- NEW REGISTRATION VALIDATION ---
        if (eventData.isExternalRegistration && !eventData.registrationUrl) {
             console.error("Form validation failed. External Registration is enabled but URL is missing.");
             setSubmissionStatus('error_url');
             setIsSubmitting(false);
             return;
        }
        
        // You could also add validation that if not external, customFields must have at least one field.
        // if (!eventData.isExternalRegistration && eventData.customFields.length === 0) {
        //     console.error("Form validation failed. Internal registration must have at least one custom field.");
        //     setSubmissionStatus('error_custom_fields');
        //     setIsSubmitting(false);
        //     return;
        // }


        // NOTE: In a real application, you would send eventData.posterFile and eventData.bannerFile to the server.
        console.log("Mock Uploading Files: Card Poster:", eventData.posterFile.name, "Banner:", eventData.bannerFile.name);

        setTimeout(() => {
            console.log("Event Submission Data:", eventData);
            setIsSubmitting(false);
            setSubmissionStatus('success');
        }, 2000);
    };

    if (submissionStatus === 'success') {
        return (
            <div className="max-w-4xl mx-auto py-20 px-4 sm:px-6 lg:px-8 text-center min-h-screen bg-gray-950">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h2 className="text-4xl font-extrabold text-white mb-4">Event Hosted successfully!</h2>
                <p className="text-lg text-gray-300">
                    Your event **{eventData.title}** has been submitted for review.
                </p>
                <div className="mt-8">
                    <button 
                        onClick={() => { 
                            setSubmissionStatus(null); 
                            router.replace(parentPathname, { scroll: true });
                        }} 
                        className="inline-flex items-center bg-purple-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Go Back to Events
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-950 text-white font-sans antialiased">
            <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 relative">
                
                {/* --- Cancel Button --- */}
                <button
                    onClick={handleCancelHost}
                    className="absolute top-10 right-4 sm:right-6 lg:right-8 p-2 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors z-10"
                    title="Cancel Hosting and Go Back"
                >
                    <X className="w-6 h-6" />
                </button>
                
                <SectionTitle icon={Plus} className="justify-center">Host Your Event 🚀</SectionTitle>
                <p className="text-center text-gray-400 mb-10">Fill in the details below to list your event.</p>

                <form onSubmit={handleSubmit} className="space-y-10">
                    
                    {/* --- Basic Information --- */}
                    <div className="bg-gray-900 p-8 rounded-xl shadow-2xl space-y-6 border border-gray-800">
                        <SectionTitle icon={ClipboardList}>Basic Details</SectionTitle>
                        
                        <InputField
                            label="Event Title"
                            name="title"
                            value={eventData.title}
                            onChange={handleInputChange}
                            placeholder="e.g., Global Tech Summit 2026"
                            required
                        />

                        <InputField
                            label="Tagline / Short Description"
                            name="tagline"
                            value={eventData.tagline}
                            onChange={handleInputChange}
                            placeholder="e.g., Where News Gets Twisted and AI Gets Awesome!"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SelectField
                                label="Category"
                                name="category"
                                value={eventData.category}
                                onChange={handleInputChange}
                                options={categories}
                                required
                            />
                            <InputField
                                label="Main Event Date"
                                name="date"
                                type="date"
                                value={eventData.date}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <TagSelector selectedTags={eventData.tags} onTagToggle={handleTagToggle} />
                    </div>

                    {/* --- Venue and Logistics --- */}
                    <div className="bg-gray-900 p-8 rounded-xl shadow-2xl space-y-6 border border-gray-800">
                        <SectionTitle icon={MapPin}>Venue & Images</SectionTitle>
                        
                        <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
                             <div className="flex items-center space-x-2">
                                 <input
                                     type="checkbox"
                                     name="isOnline"
                                     id="isOnline"
                                     checked={eventData.isOnline}
                                     onChange={handleInputChange}
                                     className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                                 />
                                 <label htmlFor="isOnline" className="text-sm font-medium text-gray-300">
                                     Online Event
                                 </label>
                             </div>
                            
                             <div className="flex items-center space-x-2">
                                 <input
                                     type="checkbox"
                                     name="isFree"
                                     id="isFree"
                                     checked={eventData.isFree}
                                     onChange={(e) => {
                                         handleInputChange(e);
                                         const tagsWithoutPricing = eventData.tags.filter(t => t !== "Free" && t !== "Paid");
                                         const newTag = e.target.checked ? "Free" : "Paid";
                                         setEventData(prev => ({ ...prev, tags: [...tagsWithoutPricing, newTag] }));
                                     }}
                                     className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                                 />
                                 <label htmlFor="isFree" className="text-sm font-medium text-gray-300">
                                     Free Event
                                 </label>
                             </div>
                        </div>

                        <InputField
                            label="Venue (Location or URL)"
                            name="venue"
                            value={eventData.venue}
                            onChange={handleInputChange}
                            placeholder={eventData.isOnline ? "e.g., Zoom Link | Discord Server" : "e.g., KIIT Auditorium | Rose Garden, Campus-18"}
                            required
                        />

                        {/* --- DUAL IMAGE UPLOAD SECTION --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            <ImageUploader
                                label="1. Card Poster (Portrait)"
                                ratioTip="Used for event cards on the main listing page (e.g., 4:3 or 1:1 ratio preferred)."
                                name="posterFile"
                                file={eventData.posterFile}
                                previewUrl={eventData.posterPreviewUrl}
                                onFileChange={(e) => handleFileChange(e, 'posterFile', 'posterPreviewUrl')}
                                onRemove={() => handleFileChange({ target: { files: [] } }, 'posterFile', 'posterPreviewUrl')}
                            />
                            <ImageUploader
                                label="2. Header Banner (Landscape)"
                                ratioTip="Used for the large banner on the event details page (e.g., 4:1 or 5:2 wide ratio preferred)."
                                name="bannerFile"
                                file={eventData.bannerFile}
                                previewUrl={eventData.bannerPreviewUrl}
                                onFileChange={(e) => handleFileChange(e, 'bannerFile', 'bannerPreviewUrl')}
                                onRemove={() => handleFileChange({ target: { files: [] } }, 'bannerFile', 'bannerPreviewUrl')}
                            />
                        </div>
                        {/* ---------------------------------- */}

                    </div>
                    
                    {/* --- Organizer and Registration --- */}
                    <div className="bg-gray-900 p-8 rounded-xl shadow-2xl space-y-6 border border-gray-800">
                        <SectionTitle icon={User}>Organizer & Registration</SectionTitle>

                        <InputField
                            label="Hosted By (Name of the Club/Organization)"
                            name="hostedBy"
                            value={eventData.hostedBy}
                            onChange={handleInputChange}
                            placeholder="e.g., IBS Hyderabad | KIIT E-Cell"
                            required
                        />
                        
                        <InputField
                            label="Eligibility"
                            name="eligibility"
                            value={eventData.eligibility}
                            onChange={handleInputChange}
                            placeholder="e.g., Open to all students | Only 2nd & 3rd year B.Tech"
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <InputField
                                 label="Registration Start Date"
                                 name="registrationStart"
                                 type="date"
                                 value={eventData.registrationStart}
                                 onChange={handleInputChange}
                             />
                             <InputField
                                 label="Registration End Date"
                                 name="registrationEnd"
                                 type="date"
                                 value={eventData.registrationEnd}
                                 onChange={handleInputChange}
                             />
                        </div>

                        <InputField
                            label="Prizes for Winners"
                            name="prizes"
                            value={eventData.prizes}
                            onChange={handleInputChange}
                            placeholder="e.g., Cash prizes up to ₹1,00,000, internship opportunities..."
                        />
                    </div>

                    {/* --- Event Rounds/Stages --- */}
                    <div className="bg-gray-900 p-8 rounded-xl shadow-2xl space-y-6 border border-gray-800">
                        <SectionTitle icon={Clock}>Event Stages & Timeline</SectionTitle>

                        {eventData.rounds.map((round, index) => (
                            <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-4 relative">
                                <h3 className="text-lg font-bold text-purple-400">Round {index + 1}</h3>
                                {eventData.rounds.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeRound(index)}
                                        className="absolute top-4 right-4 p-1 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                                        title="Remove Round"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                                <InputField
                                    label="Round Title"
                                    value={round.title}
                                    onChange={(e) => handleRoundChange(index, 'title', e.target.value)}
                                    placeholder="e.g., Qualifier Round 1: Online Quiz"
                                    required
                                />
                                <InputField
                                    label="Round Date"
                                    type="date"
                                    value={round.date}
                                    onChange={(e) => handleRoundChange(index, 'date', e.target.value)}
                                    required
                                />
                                <InputField
                                    label="Description"
                                    value={round.description}
                                    onChange={(e) => handleRoundChange(index, 'description', e.target.value)}
                                    placeholder="e.g., Submit your brand strategy pitch."
                                />
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addRound}
                            className="w-full inline-flex items-center justify-center bg-gray-700 text-white font-medium py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors mt-4"
                        >
                            <Plus className="w-5 h-5 mr-2" /> Add Another Round
                        </button>
                    </div>

                    {/* --- CUSTOM DATA FIELDS SECTION (Form Customization) --- */}
                    <div className="bg-gray-900 p-8 rounded-xl shadow-2xl space-y-6 border border-gray-800">
                        <SectionTitle icon={Menu}>Registration Form Customization</SectionTitle>

                        {/* --- NEW EXTERNAL REGISTRATION TOGGLE --- */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg border border-purple-500/50">
                                <input
                                    type="checkbox"
                                    name="isExternalRegistration"
                                    id="isExternalRegistration"
                                    checked={eventData.isExternalRegistration}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                                />
                                <label htmlFor="isExternalRegistration" className="text-base font-bold text-purple-400 flex items-center">
                                    <ExternalLink className="w-5 h-5 mr-2" />
                                    Enable **External Registration Link**
                                </label>
                            </div>

                            {eventData.isExternalRegistration ? (
                                <>
                                    <p className="text-red-400 text-sm">
                                        ⚠️ **Note:** When this is enabled, the Custom Fields section below is ignored. Users will be redirected to the URL provided here.
                                    </p>
                                    <InputField
                                        label="External Registration URL"
                                        name="registrationUrl"
                                        value={eventData.registrationUrl}
                                        onChange={handleInputChange}
                                        placeholder="e.g., https://eventbrite.com/your-event-link"
                                        type="url"
                                        required // Validation handled in handleSubmit, but good for UX
                                    />
                                </>
                            ) : (
                                <>
                                    <p className="text-gray-400 text-sm mb-4">
                                        Define additional fields you want to collect from users when they register for your event (e.g., College ID, T-Shirt Size).
                                    </p>
                                    
                                    {eventData.customFields.map((field, index) => (
                                        <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3 relative">
                                            <h3 className="text-lg font-bold text-yellow-400">Custom Field {index + 1}</h3>
                                            
                                            <button
                                                type="button"
                                                onClick={() => removeCustomField(index)}
                                                className="absolute top-4 right-4 p-1 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                                                title="Remove Field"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            
                                            <InputField
                                                label="Field Label (What the user sees)"
                                                value={field.name}
                                                onChange={(e) => handleCustomFieldChange(index, 'name', e.target.value)}
                                                placeholder="e.g., T-Shirt Size"
                                                required
                                            />
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <SelectField
                                                    label="Input Type"
                                                    value={field.type}
                                                    onChange={(e) => handleCustomFieldChange(index, 'type', e.target.value)}
                                                    options={[{name: 'text'}, {name: 'number'}, {name: 'email'}, {name: 'date'}, {name: 'checkbox'}]}
                                                    required
                                                />
                                                <div className="flex items-center space-x-2 pt-8">
                                                    <input
                                                        type="checkbox"
                                                        id={`required-${index}`}
                                                        checked={field.required}
                                                        onChange={(e) => handleCustomFieldChange(index, 'required', e.target.checked)}
                                                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                                                    />
                                                    <label htmlFor={`required-${index}`} className="text-sm font-medium text-gray-300">
                                                        Required Field
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={addCustomField}
                                        className="w-full inline-flex items-center justify-center bg-gray-700 text-white font-medium py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors mt-4"
                                    >
                                        <Plus className="w-5 h-5 mr-2" /> Add Custom Field
                                    </button>
                                </>
                            )}
                        </div>
                        {/* ------------------------------------------------------------------ */}

                    </div>
                    {/* --- Submission Button --- */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-purple-600 text-white font-extrabold text-lg rounded-xl hover:bg-purple-700 transition-colors shadow-2xl shadow-purple-500/30 disabled:bg-gray-600 disabled:shadow-none"
                    >
                        {isSubmitting ? 'Submitting Event...' : 'Host Event'}
                    </button>
                    {submissionStatus === 'error' && (
                        <p className="text-red-500 text-center mt-4">
                            Please correct the form errors and fill out all required fields, **including both images**.
                        </p>
                    )}
                    {submissionStatus === 'error_url' && (
                         <p className="text-red-500 text-center mt-4">
                             **External Registration** is enabled, please provide a valid **Registration URL**.
                         </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default HostEventPage;