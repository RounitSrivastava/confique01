// components/EventDetailsPage.jsx (or details.jsx)
"use client";
import React, { useState, useEffect, useCallback } from "react";
// Import useRouter for navigation (though not strictly needed here, good practice)
// import { useRouter } from "next/navigation"; 

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

const SectionTitle = ({ children, icon: Icon }) => (
    <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-3 flex items-center">
        {Icon && <Icon className="w-6 h-6 mr-3 text-purple-400" />}
        {children}
    </h2>
);


const EventDetailsPage = ({ event: displayEvent, onBackClick, EVENT_DETAIL_DATA_MOCK, IconSet }) => {
    const [activeTab, setActiveTab] = useState("Details");
    const [registrationStatus, setRegistrationStatus] = useState('Open');

    const { 
        Clock, ClipboardList, ZapOff, ArrowLeft, Calendar, User: UserIcon, Gift, CheckCircle, Zap
    } = IconSet;
    
    // Check if we are using the detailed mock structure
    const isComplexData = (displayEvent.id === EVENT_DETAIL_DATA_MOCK.id || displayEvent.title === EVENT_DETAIL_DATA_MOCK.title);
    const roundsData = isComplexData ? EVENT_DETAIL_DATA_MOCK : displayEvent;

    // --- LOGIC: Extract Team/Solo Tag ---
    const participationFormat = displayEvent.tags?.find(tag => tag.includes("Team") || tag.includes("Solo")) || 'Individual/Team (Check details)';
    
    // --- NEW LOGIC: Extract Team Size ---
    const teamMatch = participationFormat.match(/\((\d+)\)/);
    const teamSize = teamMatch ? teamMatch[1] : (participationFormat.includes('Solo') ? '1' : 'Varies');
    // ----------------------------------------

    const sidebarDetails = {
        hostedBy: roundsData.hostedBy || displayEvent.hostedBy || 'Various hosts',
        eligibility: roundsData.eligibility || 'Open to all students.',
        // UPDATED: Use explicit registration fields from displayEvent (as collected in HostPage)
        registration: {
            start: displayEvent.registrationStart || roundsData.registration?.start || displayEvent.date,
            end: displayEvent.registrationEnd || roundsData.registration?.end || 'TBD',
            status: roundsData.registration?.status || 'Open' 
        },
        tagline: roundsData.tagline || displayEvent.tagline || displayEvent.category,
        rounds: roundsData.rounds || displayEvent.rounds || []
    };

    const checkEventStatus = useCallback(() => {
        try {
            const eventDate = new Date(displayEvent.date);
            const today = new Date();

            today.setHours(0, 0, 0, 0);

            if (eventDate < today) {
                return 'Ended';
            }
            return 'Open';
        } catch (error) {
            return 'Open';
        }
    }, [displayEvent.date]);

    useEffect(() => {
        if (registrationStatus === 'Open') {
            const status = checkEventStatus();
            if (status === 'Ended') {
                setRegistrationStatus('Ended');
            }
        }
    }, [checkEventStatus, registrationStatus]);

    const handleRegister = () => {
        if (registrationStatus === 'Open') {
            setRegistrationStatus('Registered');
            console.log(`Registered for ${displayEvent.title}`);
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
        return {
            text: 'Register Now',
            className: 'w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/30',
            disabled: false,
            Icon: null,
        };
    };

    const buttonProps = getButtonProps();

    const renderContent = () => {

        switch (activeTab) {
            case "Stages & Timeline":
                if (sidebarDetails.rounds.length === 0) {
                    return (
                        <div className="text-center py-10 text-gray-400">
                            <ZapOff className="w-8 h-8 mx-auto mb-4 text-purple-400" />
                            <p>Stage and timeline details are not yet available for this event.</p>
                        </div>
                    );
                }

                return (
                    <div className="space-y-12">
                        {sidebarDetails.rounds.map((round, index) => (
                            <div key={index} className="flex space-x-6">
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${index === 0 ? 'bg-purple-600' : 'bg-gray-700'}`}>
                                        {index + 1}
                                    </div>
                                    {index < sidebarDetails.rounds.length - 1 && (
                                        <div className="w-px h-full bg-gray-700 my-2" />
                                    )}
                                </div>
                                <div className="pb-8 flex-grow">
                                    <p className="text-sm text-purple-400 font-medium flex items-center mb-1">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {round.date}
                                    </p>
                                    <h3 className="text-xl font-bold text-white mb-2">{round.title}</h3>
                                    <p className="text-gray-300">{round.description}</p>
                                    {round.rules && (
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
                        <SectionTitle icon={ClipboardList}>{displayEvent.title} Overview</SectionTitle>

                        {sidebarDetails.rounds.length > 0 ? (
                            <>
                                <p className="text-gray-300 text-lg leading-relaxed">
                                    Welcome! This event, **{displayEvent.title.split(' - ')[0]}**, challenges participants across multiple stages designed to test various skills.
                                </p>
                                <p className="text-gray-300 text-lg leading-relaxed">
                                    {isComplexData ? "If you're ready to think smart, act fast, and deliver the most engaging content under pressure, register now!" : "Read the timeline to prepare your strategy for registration and submission deadlines."}
                                </p>
                            </>
                        ) : (
                            <p className="text-gray-300 text-lg leading-relaxed">
                                This is the detailed description for the event: **{displayEvent.title}**. This section would contain comprehensive information about the structure, prizes, and theme of the event.
                            </p>
                        )}

                        <SectionTitle icon={UserIcon}>Organizer & Contact</SectionTitle>
                        <p className="text-gray-300">
                            Hosted by: <span className="font-semibold text-purple-400">{sidebarDetails.hostedBy}</span>
                        </p>

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
                    // UPDATED IMAGE SOURCE: Use 'banner' for the wide header, fall back to 'poster'
                    src={displayEvent.banner || displayEvent.poster}
                    alt={displayEvent.title}
                    className="w-full h-full object-cover object-center opacity-70"
                />
                <div className="absolute inset-0 bg-black/70 flex items-center">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        <p className="text-purple-400 font-semibold text-sm uppercase mb-2">
                            {displayEvent.category} by {sidebarDetails.hostedBy}
                        </p>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                            {displayEvent.title}
                        </h1>
                        <p className="text-xl text-gray-300 mt-2">{sidebarDetails.tagline || displayEvent.title}</p>
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

                        <div className="space-y-6 sticky top-20">

                            {/* 1. Registration Card (Main Action) */}
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl space-y-4">
                                <div className="flex items-center justify-between text-white font-bold text-xl">
                                    <p>Registration</p>
                                    <Zap className="w-6 h-6 text-purple-400" />
                                </div>
                                <div className="space-y-2 text-gray-300 text-sm">
                                    <p className="flex justify-between">
                                        Start Date: <span className="font-medium text-white">{sidebarDetails.registration.start || displayEvent.date}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        End Date: <span className="font-medium text-white">{sidebarDetails.registration.end || 'TBD'}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        Fees: <span className="font-medium text-green-400">{displayEvent.tags?.includes("Free") ? "Free" : "Paid"}</span>
                                    </p>
                                    {/* --- ADDED: Participation Format --- */}
                                    <p className="flex justify-between">
                                        Format: <span className={`font-medium ${participationFormat.includes("Team") ? 'text-blue-400' : 'text-yellow-400'}`}>{participationFormat}</span>
                                    </p>
                                    {/* --- ADDED: Team Size / Required Teammates --- */}
                                    {participationFormat.includes('Team') && (
                                        <p className="flex justify-between">
                                            Teammates: <span className="font-medium text-white">{teamSize} members</span>
                                        </p>
                                    )}
                                    {/* ----------------------------------- */}
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

                            {/* 2. Eligibility Card */}
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl space-y-3">
                                <div className="flex items-center space-x-3">
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                    <p className="text-lg font-semibold text-white">Eligibility</p>
                                </div>
                                <p className="text-gray-300 text-sm">{sidebarDetails.eligibility}</p>
                            </div>

                            {/* 3. Prizes for Winners Card */}
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl space-y-3">
                                <div className="flex items-center space-x-3">
                                    <Gift className="w-5 h-5 text-yellow-400" />
                                    <p className="text-lg font-semibold text-white">Prizes for Winners</p>
                                </div>
                                <p className="text-gray-300 text-sm">
                                    {displayEvent.title.includes('L\'Oréal') ? (
                                        "Internship opportunities, Fast Track HR interviews, and cash prizes."
                                    ) : (
                                        "Cash prizes up to ₹1,00,000, exciting goodies, and certificates for top winners."
                                    )}
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailsPage;