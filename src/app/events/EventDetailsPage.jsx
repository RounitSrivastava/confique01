// components/EventDetailsPage.jsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
    Clock, ClipboardList, ZapOff, ArrowLeft, Calendar, User, Gift, CheckCircle, Zap, Eye, MapPin, Code, Shirt, Medal, Compass, BookOpen, MessageSquare, ExternalLink, QrCode,
    List, TrendingUp
} from "lucide-react";

// Reusable SectionTitle component
const SectionTitle = ({ children, icon: Icon, className = "" }) => (
    <h2 className={`text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-3 flex items-center ${className}`}>
        {Icon && <Icon className="w-6 h-6 mr-3 text-purple-400" />}
        {children}
    </h2>
);

const TabButton = ({ name, icon: Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`
          flex items-center space-x-2 px-6 py-3 text-base font-semibold border-b-2 transition-all duration-300
          ${isActive
              ? "border-purple-600 text-white"
              : "border-transparent text-gray-400 hover:text-white hover:border-gray-700"}
          whitespace-nowrap
        `}
    >
        {Icon && <Icon className="w-5 h-5" />}
        <span>{name}</span>
    </button>
);

// --- Related Event Card (Updated to precisely match the visual layout in the image) ---
const RelatedEventCard = ({ event, onDetailsClick }) => (
    <div 
        className="bg-gray-900 border border-gray-800 rounded-xl p-4 transition-transform duration-300 hover:scale-[1.02] cursor-pointer shadow-lg hover:shadow-purple-500/20"
        onClick={() => onDetailsClick(event.id)}
    >
        <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h4 className="text-xl font-extrabold text-white truncate">{event.title}</h4>
        </div>
        
        {/* VITAL FIX: Use a grid or flex setup with fixed space for alignment */}
        <div className="text-gray-400 text-base space-y-3">
            
            {/* Row 1: Date */}
            <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-4 flex-shrink-0" />
                <span className="flex justify-between w-full">
                    <span className="w-24 flex-shrink-0">Date:</span>
                    <span className="font-medium text-white text-right">{event.date.split(',')[0].trim() || 'TBD'}</span>
                </span>
            </div>

            {/* Row 2: Category */}
            <div className="flex items-center">
                <Compass className="w-5 h-5 mr-4 flex-shrink-0" />
                <span className="flex justify-between w-full">
                    <span className="w-24 flex-shrink-0">Category:</span>
                    <span className="font-medium text-purple-400 text-right">{event.category}</span>
                </span>
            </div>

            {/* Row 3: Impressions */}
            <div className="flex items-center">
                <Eye className="w-5 h-5 mr-4 flex-shrink-0" />
                <span className="flex justify-between w-full">
                    <span className="w-24 flex-shrink-0">Impressions:</span>
                    <span className="font-medium text-white text-right">{event.impressions?.toLocaleString() || 'N/A'}</span>
                </span>
            </div>
        </div>
    </div>
);
// ----------------------------------------


const EventDetailsPage = ({ event: displayEvent, onBackClick, EVENT_DETAIL_DATA_MOCK, relatedEvents = [], onDetailsClick }) => {
    
    const [activeTab, setActiveTab] = useState("Stages & Timeline"); 
    const [registrationStatus, setRegistrationStatus] = useState('Open');

    // Destructure event details, providing sensible fallbacks
    const {
        title, date, category, tagline, hostedBy, eligibility, prizes, isExternalRegistration, registrationUrl,
        poster, banner, impressions, rounds = [], isFree, paymentAmount
    } = displayEvent;

    const CURRENCY_SYMBOL = "₹"; 
    
    // --- LOGIC: Extract Team/Solo Tag & Size ---
    const participationFormat = displayEvent.tags?.find(tag => tag.includes("Team") || tag.includes("Solo")) || 'Individual/Team (Check details)';
    
    const teamMatch = participationFormat.match(/\((\d+)\)/);
    const teamSize = teamMatch ? teamMatch[1] : (participationFormat.includes('Solo') ? '1' : 'Varies');
    // ----------------------------------------
    
    // Simplified registration dates
    const regStart = displayEvent.registrationStart || 'TBD';
    const regEnd = displayEvent.registrationEnd || 'TBD';

    // Event rounds
    const eventRounds = rounds.length > 0 ? rounds : (EVENT_DETAIL_DATA_MOCK?.rounds || []);

    const checkEventStatus = useCallback(() => {
        try {
            const eventDate = new Date(date);
            const today = new Date();

            today.setHours(0, 0, 0, 0);

            if (eventDate < today) {
                return 'Ended';
            }
            return 'Open';
        } catch (error) {
            return 'Open';
        }
    }, [date]);

    useEffect(() => {
        if (registrationStatus === 'Open') {
            const status = checkEventStatus();
            if (status === 'Ended') {
                setRegistrationStatus('Ended');
            }
        }
    }, [checkEventStatus, registrationStatus]);

    const handleRegister = () => {
        if (registrationStatus !== 'Open') return;
        
        if (isExternalRegistration && registrationUrl) {
            console.log(`Redirecting to external registration: ${registrationUrl}`);
            window.open(registrationUrl, '_blank');
        } else {
            setRegistrationStatus('Registered');
            console.log(`Mock-Registered for ${title}`);
        }
    };

    const getButtonProps = () => {
        if (registrationStatus === 'Registered') {
            return {
                text: '✓ Registered',
                className: 'w-full py-3 bg-green-600 text-white font-bold rounded-lg cursor-default shadow-lg shadow-green-500/30 flex items-center justify-center',
                disabled: true,
                Icon: CheckCircle,
            };
        }
        if (registrationStatus === 'Ended') {
            return {
                text: 'Event Ended',
                className: 'w-full py-3 bg-gray-600 text-gray-400 font-bold rounded-lg cursor-not-allowed shadow-none flex items-center justify-center',
                disabled: true,
                Icon: Clock,
            };
        }
        
        const buttonText = isExternalRegistration ? 'Go to External Registration' : 'Register Now';

        return {
            text: buttonText,
            className: 'w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/30 flex items-center justify-center',
            disabled: false,
            Icon: isExternalRegistration ? ExternalLink : null,
        };
    };

    const buttonProps = getButtonProps();

    const renderContent = () => {
        switch (activeTab) {
            case "Stages & Timeline":
                if (eventRounds.length === 0) {
                    return (
                        <div className="text-center py-10 text-gray-400">
                            <ZapOff className="w-8 h-8 mx-auto mb-4 text-purple-400" />
                            <p>Stage and timeline details are not yet available for this event.</p>
                        </div>
                    );
                }

                return (
                    <div className="space-y-12">
                        <SectionTitle icon={Clock}>Event Stages</SectionTitle>
                        {eventRounds.map((round, index) => (
                            <div key={index} className="flex space-x-6">
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${index === 0 ? 'bg-purple-600' : 'bg-gray-700'}`}>
                                        {index + 1}
                                    </div>
                                    {index < eventRounds.length - 1 && (
                                        <div className="w-px h-full bg-gray-700 my-2" />
                                    )}
                                </div>
                                <div className="pb-8 flex-grow">
                                    <p className="text-sm text-purple-400 font-medium flex items-center mb-1">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {round.date || 'TBD'}
                                    </p>
                                    <h3 className="text-xl font-bold text-white mb-2">{round.title || `Round ${index + 1}`}</h3>
                                    <p className="text-gray-300">{round.description || 'Details coming soon.'}</p>
                                    {round.rules && ( // Mock rule display, only available in rich mock data
                                        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                                            <p className="font-semibold text-white mb-2">Rules:</p>
                                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                                                {round.rules.map((rule, i) => (
                                                    <li key={i}>{rule}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case "Details":
                return (
                    <div className="space-y-8">
                        <SectionTitle icon={ClipboardList}>**{title}** Overview</SectionTitle>

                        <p className="text-gray-300 text-lg leading-relaxed">
                            {tagline || 'No short description provided. Please check the sidebar for essential details like eligibility and registration dates.'}
                        </p>
                        
                        <p className="text-gray-300 text-lg leading-relaxed">
                            The event is scheduled for **{new Date(date).toLocaleDateString()}**. Get ready to participate in the **{category}** category!
                        </p>
                        
                        <SectionTitle icon={User}>Organizer & Contact</SectionTitle>
                        <p className="text-gray-300">
                            Hosted by: <span className="font-semibold text-purple-400">{hostedBy || 'The Host Organization'}</span>
                        </p>
                        <p className="text-gray-300">
                            Location: <span className="font-semibold text-purple-400">{displayEvent.venue || (displayEvent.isOnline ? 'Online' : 'TBD')}</span>
                        </p>
                        <p className="text-gray-300">
                            For any queries, please reach out via our official communication channels.
                        </p>

                        {/* Optional: Include custom fields/registration info if not external */}
                        {!isExternalRegistration && (
                            <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-yellow-500">
                                <p className="font-semibold text-yellow-300 mb-2">Registration Notes:</p>
                                <p className="text-sm text-gray-300">
                                    This event uses our internal registration form. Prepare to submit **{participationFormat}** details. Additional custom fields may be required.
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
            {/* Back Button */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <button
                    onClick={onBackClick}
                    className="flex items-center text-gray-400 hover:text-purple-400 transition-colors font-semibold"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to All Events
                </button>
            </div>

            {/* Event Header Hero */}
            <div className="relative h-[280px] overflow-hidden">
                <img
                    src={banner || poster} // Use banner first, fallback to poster
                    alt={title}
                    className="w-full h-full object-cover object-center opacity-70"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-black/70 flex items-center">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        <p className="text-purple-400 font-semibold text-sm uppercase mb-2">
                            {category} by **{hostedBy || 'Host'}**
                        </p>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                            {title}
                        </h1>
                        <p className="text-xl text-gray-300 mt-2">{tagline || title}</p>
                    </div>
                </div>
            </div>

            {/* Main Content & Sidebar Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="lg:grid lg:grid-cols-12 lg:gap-10">

                    {/* Left Column: Tabs & Content */}
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

                    {/* Right Column: Sidebar (Sticky) */}
                    <div className="lg:col-span-4 mt-10 lg:mt-0 space-y-6">

                        <div className="space-y-6 lg:sticky lg:top-20">
                            
                            {/* 1. Registration Card (Main Action) */}
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl space-y-4">
                                
                                {/* Registration Header */}
                                <div className="flex items-center justify-between text-white font-bold text-xl">
                                    <p>Registration</p>
                                    <Zap className="w-6 h-6 text-purple-400" />
                                </div>
                                
                                {/* Registration Details */}
                                <div className="space-y-2 text-gray-300 text-sm">
                                    <p className="flex justify-between">
                                        Main Date: <span className="font-medium text-white">{new Date(date).toLocaleDateString()}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        Start Date: <span className="font-medium text-white">{regStart}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        End Date: <span className="font-medium text-white">{regEnd}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        Fees: <span className={`font-medium ${isFree ? 'text-green-400' : 'text-yellow-400'}`}>{isFree ? "Free" : `${CURRENCY_SYMBOL}${paymentAmount || 'TBD'}`}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        Format: <span className={`font-medium ${participationFormat.includes("Team") ? 'text-blue-400' : 'text-yellow-400'}`}>{participationFormat}</span>
                                    </p>
                                    {participationFormat.includes('Team') && (
                                        <p className="flex justify-between">
                                            Team Size: <span className="font-medium text-white">{teamSize} members</span>
                                        </p>
                                    )}
                                </div>

                                {/* DYNAMIC REGISTER BUTTON */}
                                <button
                                    onClick={handleRegister}
                                    disabled={buttonProps.disabled}
                                    className={buttonProps.className}
                                >
                                    {buttonProps.Icon && <buttonProps.Icon className="w-5 h-5 mr-2" />}
                                    {buttonProps.text}
                                </button>
                                {/* END DYNAMIC REGISTER BUTTON */}

                            </div>
                            {/* END Registration Card */}


                            {/* 2. Eligibility Card */}
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl space-y-3">
                                <div className="flex items-center space-x-3">
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                    <p className="text-lg font-semibold text-white">Eligibility</p>
                                </div>
                                <p className="text-gray-300 text-sm">{eligibility || 'Please check the official event PDF for details.'}</p>
                            </div>

                            {/* 3. Prizes for Winners Card */}
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl space-y-3">
                                <div className="flex items-center space-x-3">
                                    <Gift className="w-5 h-5 text-yellow-400" />
                                    <p className="text-lg font-semibold text-white">Prizes for Winners</p>
                                </div>
                                <p className="text-gray-300 text-sm">
                                    {prizes || "Prizes include cash rewards, exciting goodies, and certificates for top performers."}
                                </p>
                            </div>
                            
                            {/* 4. Impressions Card */}
                            {impressions !== undefined && (
                                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl space-y-3">
                                    <div className="flex items-center justify-between text-white font-bold text-xl">
                                        <div className="flex items-center space-x-3">
                                            <Eye className="w-6 h-6 text-purple-400" />
                                            <p className="text-lg font-semibold text-white">Impressions</p>
                                        </div>
                                        <p className="text-2xl text-purple-400">
                                            {impressions?.toLocaleString() || 'N/A'}
                                        </p>
                                    </div>
                                    <p className="text-gray-400 text-xs">
                                        This figure shows the real-time engagement count for this event page.
                                    </p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* --- RELATED EVENTS SECTION --- */}
                <div className="mt-16 pt-8 border-t border-gray-800">
                    <SectionTitle icon={List}>Related Events You Might Like</SectionTitle>
                    {relatedEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Renders RelatedEventCard, which displays details on separate lines */}
                            {relatedEvents.map((event, index) => (
                                <RelatedEventCard 
                                    key={event.id || index} 
                                    event={event} 
                                    onDetailsClick={onDetailsClick} 
                                />
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-10 text-gray-400">
                            <Compass className="w-8 h-8 mx-auto mb-4 text-purple-400" />
                            <p>No other events found in the **{category}** category at the moment.</p>
                        </div>
                    )}
                </div>
                {/* ---------------------------- */}

            </div>
        </div>
    );
};

export default EventDetailsPage;