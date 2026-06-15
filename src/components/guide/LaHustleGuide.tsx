'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

// --- MEMBER TOUR (Authenticated Desktop) ---
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
        target: 'LaHustle-nav-profile',
        title: 'IDENTITY NODE',
        content: 'Manage your account, view wallet balance, and update settings here.',
        position: 'bottom-right'
    },
    {
        id: 'marketplace',
        target: 'LaHustle-nav-marketplace',
        title: 'ACQUIRE ASSETS',
        content: 'Browse the feed to find products from students near you. Use the Search to find specific halls.',
        position: 'bottom-left'
    },
];

// --- MOBILE MEMBER TOUR (Authenticated Mobile) ---
const MOBILE_MEMBER_STEPS = [
    {
        id: 'welcome_mobile',
        target: null,
        title: 'OPERATIVE WELCOME',
        content: 'Welcome to LaHustle Mobile. Let us sync your navigation.',
        position: 'center'
    },
    {
        id: 'mobile_menu',
        target: 'LaHustle-mobile-menu',
        title: 'ACCESS PORT',
        content: 'TAP THIS BUTTON to open your main command menu. Do it now, then click "Next".',
        position: 'bottom-right'
    },
    {
        id: 'mobile_marketplace',
        target: 'LaHustle-mobile-marketplace',
        title: 'MARKETPLACE',
        content: 'This is your feed. Buy, sell, and trade with students on campus.',
        position: 'bottom'
    }
];

// --- GUEST TOUR (Landing / Not Logged In) ---
const GUEST_STEPS = [
    {
        id: 'welcome_guest',
        target: null,
        title: 'LaHustle NETWORK',
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
        target: 'LaHustle-nav-signin',
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
        content: 'You must select your operating role within the LaHustle Network.',
        position: 'center'
    },
    {
        id: 'onboard_student_select',
        target: 'LaHustle-onboard-student',
        title: 'STUDENT ACCESS',
        content: 'Select this if you want to buy items or browse the feed.',
        position: 'right'
    },
    {
        id: 'onboard_vendor_select',
        target: 'LaHustle-onboard-vendor',
        title: 'VENDOR TERMINAL',
        content: 'Select this if you have a shop or service (e.g., Food, Haircut, Graphics) and want to sell.',
        position: 'left'
    }
];

const CONTAINER_MAP: Record<string, string> = {
    'LaHustle-mobile-menu': 'LaHustle-navbar',
    'LaHustle-mobile-marketplace': 'LaHustle-drawer'
};

export default function LaHustleGuide() {
    const { isSignedIn, isLoaded } = useUser();
    const pathname = usePathname();
    const [activeStep, setActiveStep] = useState<number | null>(null);
    const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 1024);
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Determine Steps & Key
    let STEPS = isSignedIn
        ? (isMobile ? MOBILE_MEMBER_STEPS : MEMBER_STEPS)
        : GUEST_STEPS;

    let STORAGE_KEY = isSignedIn ? 'LaHustle_tour_member_v1' : 'LaHustle_tour_guest_v1';

    if (pathname?.startsWith('/onboarding')) {
        STEPS = ONBOARDING_STEPS;
        STORAGE_KEY = 'LaHustle_tour_onboarding_v1';
    }

    useEffect(() => {
        if (!isLoaded) return;

        // Strict Page Rules
        const isHome = pathname === '/';
        const isMarketplace = pathname === '/marketplace';
        const isOnboarding = pathname?.startsWith('/onboarding');

        // Rule 1: Guest Tour ONLY on Home
        if (!isSignedIn && !isHome) {
            setIsVisible(false); // Sanity reset
            return;
        }

        // Rule 2: Member Tour ONLY on Marketplace (or Home fallback)
        // We don't want it popping up on /cart or /profile randomly
        if (isSignedIn && !isOnboarding && !isMarketplace && !isHome) {
            setIsVisible(false);
            return;
        }

        // Poll for conditions
        const checkStart = setInterval(() => {
            const tutorialDone = localStorage.getItem(STORAGE_KEY);
            const alphaWelcomeDone = localStorage.getItem('LH_ALPHA_WELCOME_V1_KCS');

            if (tutorialDone) {
                clearInterval(checkStart);
                return;
            }

            // Wait for Alpha Welcome to be dismissed
            if (alphaWelcomeDone) {
                // If we are on a valid page, start
                clearInterval(checkStart);
                setTimeout(() => {
                    setIsVisible(true);
                    setActiveStep(0);
                }, 1000); // 1s delay for smooth entry
            }
        }, 1000);

        return () => clearInterval(checkStart);
    }, [isLoaded, STORAGE_KEY, pathname, isSignedIn]);

    // Handle Target Highlighting & Interaction
    useEffect(() => {
        if (activeStep === null) return;
        if (!STEPS[activeStep]) return; // Safety

        const step = STEPS[activeStep];
        let highlightedElement: HTMLElement | null = null;
        let originalStyles: { zIndex: string; position: string } | null = null;

        if (step.target) {
            let attempts = 0;
            const findElement = () => {
                const el = document.getElementById(step.target!);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    // Handle case where element is hidden
                    if (rect.width === 0 && rect.height === 0) {
                        attempts++;
                        if (attempts < 10) setTimeout(findElement, 500);
                        return;
                    }

                    setCoords({
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height
                    });

                    // ELEVATE ELEMENT FOR INTERACTION
                    highlightedElement = el;

                    // Check if we need to elevate a container instead
                    const containerId = CONTAINER_MAP[step.target!];
                    let targetToElevate = el;

                    if (containerId) {
                        const containerEl = document.getElementById(containerId);
                        if (containerEl) {
                            targetToElevate = containerEl;
                        }
                    }

                    originalStyles = {
                        zIndex: targetToElevate.style.zIndex,
                        position: targetToElevate.style.position
                    };

                    targetToElevate.style.zIndex = '10000'; // Above Backdrop (9998) but below UI (10002)

                    // Ensure position is non-static for z-index to work
                    const computedPos = window.getComputedStyle(targetToElevate).position;
                    if (computedPos === 'static') {
                        targetToElevate.style.position = 'relative';
                    }

                    // If we switched to a container, update our reference for cleanup
                    highlightedElement = targetToElevate;

                } else {
                    attempts++;
                    if (attempts < 10) {
                        setTimeout(findElement, 500);
                    } else {
                        console.log(`Target ${step.target} not found, ignoring...`);
                        handleNext(true);
                    }
                }
            };
            findElement();
        } else {
            setCoords(null);
        }

        // Cleanup function to restore styles
        return () => {
            if (highlightedElement && originalStyles) {
                highlightedElement.style.zIndex = originalStyles.zIndex;
                highlightedElement.style.position = originalStyles.position;
            }
        };
    }, [activeStep, STEPS]);

    const handleNext = (autoSkip = false) => {
        if (activeStep === null) return;

        let next = activeStep + 1;
        if (autoSkip) {
            // If checking next step... recursion risk if next is also missing.
            // Simple logic: just go next. element check handles recursion naturally via useEffect
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

    // Tour globally disabled per user request
    return null;
}
