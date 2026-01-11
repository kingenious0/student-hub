'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

// --- MEMBER TOUR (Authenticated Dashboard) ---
const MEMBER_STEPS = [
    {
        id: 'welcome_member',
        target: null,
        title: 'SYSTEM INITIALIZED',
        content: 'Welcome back, Agent. Quick orientation protocol initiated.',
        position: 'center'
    },
    {
        id: 'profile',
        target: 'omni-nav-profile',
        title: 'IDENTITY NODE',
        content: 'Manage your account, view wallet balance, and update settings here.',
        position: 'bottom-right'
    },
    {
        id: 'marketplace',
        target: 'omni-nav-marketplace',
        title: 'ACQUIRE ASSETS',
        content: 'Browse the feed to find products from students near you. Use the Search to find specific halls.',
        position: 'bottom-left'
    },
    {
        id: 'pulse',
        target: 'omni-nav-pulse',
        title: 'CAMPUS PULSE',
        content: 'Intercept live signals. See what is happening on campus right now.',
        position: 'bottom-left'
    },
    {
        id: 'runner',
        target: 'omni-nav-runner',
        title: 'SHADOW RUNNER',
        content: 'Want to earn cash? Activate Runner Mode to deliver items.',
        position: 'bottom-left'
    }
];

// --- GUEST TOUR (Landing / Not Logged In) ---
const GUEST_STEPS = [
    {
        id: 'welcome_guest',
        target: null,
        title: 'OMNI NETWORK',
        content: 'The centralized marketplace for university students. Food, tech, services - all in one terminal.',
        position: 'center'
    },
    {
        id: 'escrow_guest',
        target: null,
        title: 'SHIELD PROTOCOL',
        content: 'Your money is safe. We hold payments in Escrow until you confirm you have received your item.',
        position: 'center'
    },
    {
        id: 'signin_guest',
        target: 'omni-nav-signin',
        title: 'INITIALIZE IDENTITY',
        content: 'Sign in to access the network. Students and Vendors verify here.',
        position: 'bottom-right'
    }
];

// --- ONBOARDING TOUR (During Setup) ---
const ONBOARDING_STEPS = [
    {
        id: 'onboard_welcome',
        target: null,
        title: 'PROFILE CONFIGURATION',
        content: 'You must select your operating role within the OMNI Network.',
        position: 'center'
    },
    {
        id: 'onboard_student_select',
        target: 'omni-onboard-student',
        title: 'STUDENT ACCESS',
        content: 'Select this if you want to buy items, browse the feed, or eventually become a Runner.',
        position: 'right'
    },
    {
        id: 'onboard_vendor_select',
        target: 'omni-onboard-vendor',
        title: 'VENDOR TERMINAL',
        content: 'Select this if you have a shop or service (e.g., Food, Haircut, Graphics) and want to sell.',
        position: 'left'
    }
];

export default function OmniGuide() {
    const { isSignedIn, isLoaded } = useUser();
    const pathname = usePathname();
    const [activeStep, setActiveStep] = useState<number | null>(null);
    const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    // Determine Steps & Key
    let STEPS = isSignedIn ? MEMBER_STEPS : GUEST_STEPS;
    let STORAGE_KEY = isSignedIn ? 'omni_tour_member_v1' : 'omni_tour_guest_v1';

    if (pathname?.startsWith('/onboarding')) {
        STEPS = ONBOARDING_STEPS;
        STORAGE_KEY = 'omni_tour_onboarding_v1';
    }

    useEffect(() => {
        if (!isLoaded) return;

        // Poll for conditions
        const checkStart = setInterval(() => {
            const tutorialDone = localStorage.getItem(STORAGE_KEY);
            const alphaWelcomeDone = localStorage.getItem('OMNI_ALPHA_WELCOME_V1_KCS');

            if (tutorialDone) {
                clearInterval(checkStart);
                return;
            }

            // Wait for Alpha Welcome (unless we are deep in the app, maybe it was skipped? but alpha needs it)
            // Actually for Onboarding, WelcomeModal might still be active?
            // Let's assume on Onboarding page, WelcomeModal might NOT appear if it only appears on layout?
            // WelcomeModal is in layout. So it appears everywhere.
            // We wait for it.
            if (alphaWelcomeDone) {
                clearInterval(checkStart);
                setTimeout(() => {
                    setIsVisible(true);
                    setActiveStep(0);
                }, 500);
            }
        }, 1000);

        return () => clearInterval(checkStart);
    }, [isLoaded, STORAGE_KEY, pathname]);

    useEffect(() => {
        if (activeStep === null) return;

        const step = STEPS[activeStep];

        // Handle Target Highlighting
        if (step.target) {
            let attempts = 0;
            const findElement = () => {
                const el = document.getElementById(step.target!);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    setCoords({
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height
                    });
                } else {
                    attempts++;
                    // More attempts for onboarding transition
                    if (attempts < 8) {
                        setTimeout(findElement, 500);
                    } else {
                        console.log(`Target ${step.target} not found, skipping...`);
                        handleNext(true);
                    }
                }
            };
            findElement();
        } else {
            setCoords(null);
        }
    }, [activeStep, STEPS]);

    const handleNext = (autoSkip = false) => {
        if (activeStep === null) return;

        let next = activeStep + 1;
        if (autoSkip) {
            if (next >= STEPS.length) {
                finishTour();
                return;
            }
        }

        if (next >= STEPS.length) {
            finishTour();
        } else {
            setActiveStep(next);
        }
    };

    const finishTour = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setIsVisible(false);
        setActiveStep(null);
    };

    if (!isVisible || activeStep === null) return null;

    const current = STEPS[activeStep];
    const isCenter = !current.target || !coords;

    // Calculate Tooltip Position
    let tooltipStyle: any = {};
    if (coords && !isCenter) {
        // Default: Bottom Center
        tooltipStyle = {
            top: coords.top + coords.height + 20,
            left: coords.left + (coords.width / 2) - 160
        };

        // Side positioning preferences from data
        if (current.position === 'right') {
            tooltipStyle = {
                top: coords.top,
                left: coords.left + coords.width + 20
            };
        }
        else if (current.position === 'left') {
            tooltipStyle = {
                top: coords.top,
                left: coords.left - 340 // width of card + margin
            };
        }
        else {
            // Smart Fallback
            if (coords.left < 50) tooltipStyle = { top: coords.top + coords.height + 20, left: 20 };
            if (coords.left > window.innerWidth - 350) tooltipStyle = { top: coords.top + coords.height + 20, left: 'auto', right: 20 };

            if (coords.top > window.innerHeight - 200) {
                tooltipStyle = {
                    bottom: window.innerHeight - coords.top + 20,
                    left: coords.left + (coords.width / 2) - 160,
                    top: 'auto'
                }
            }
        }
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex flex-col pointer-events-none font-sans">
                {/* SVG Mask Overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-auto transition-all duration-500 ease-in-out">
                    <defs>
                        <mask id="spotlight-mask">
                            <rect x="0" y="0" width="100%" height="100%" fill="white" />
                            {coords && (
                                <motion.rect
                                    initial={{ x: coords.left, y: coords.top, width: coords.width, height: coords.height }}
                                    animate={{ x: coords.left - 10, y: coords.top - 10, width: coords.width + 20, height: coords.height + 20 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    rx="24"
                                    fill="black"
                                />
                            )}
                        </mask>
                    </defs>
                    <rect
                        x="0" y="0" width="100%" height="100%"
                        fill="rgba(0,0,0,0.85)"
                        mask="url(#spotlight-mask)"
                    />

                    {/* Ring Animation */}
                    {coords && (
                        <motion.rect
                            initial={{ x: coords.left, y: coords.top, width: coords.width, height: coords.height }}
                            animate={{ x: coords.left - 10, y: coords.top - 10, width: coords.width + 20, height: coords.height + 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            rx="24"
                            fill="none"
                            stroke="#39FF14"
                            strokeWidth="2"
                            strokeDasharray="10,5"
                        />
                    )}
                </svg>

                {/* Content Card */}
                <motion.div
                    key={current.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="absolute pointer-events-auto max-w-xs w-full"
                    style={isCenter ? {
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        marginLeft: '-10rem',
                        marginTop: '-8rem'
                    } : tooltipStyle}
                >
                    <div className="bg-[#050505] border border-[#39FF14] p-6 rounded-3xl shadow-[0_0_50px_rgba(57,255,20,0.2)] relative overflow-hidden">
                        {/* Background Glitch */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#39FF14]/50 animate-pulse"></div>

                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-black text-[#39FF14] uppercase tracking-tighter shadow-green-glow">
                                {current.title}
                            </h3>
                            <span className="text-[10px] text-gray-500 font-mono">
                                {activeStep + 1} / {STEPS.length}
                            </span>
                        </div>

                        <p className="text-gray-300 font-bold text-xs leading-relaxed mb-6 uppercase tracking-wide">
                            {current.content}
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={finishTour}
                                className="px-4 py-3 rounded-xl text-gray-500 text-[10px] font-black uppercase hover:text-white transition-colors hover:bg-white/5"
                            >
                                Skip
                            </button>
                            <button
                                onClick={() => handleNext(false)}
                                className="flex-1 py-3 bg-[#39FF14] text-black rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-500/20"
                            >
                                {activeStep === STEPS.length - 1 ? 'Execute Protocol' : 'Next Step'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
