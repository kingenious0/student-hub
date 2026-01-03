'use client';

import { UserProfile } from '@clerk/nextjs';

export default function MobileProfilePage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <UserProfile
                appearance={{
                    elements: {
                        rootBox: "w-full max-w-4xl",
                        card: "bg-[#0d1117] border border-white/10 rounded-[2rem] shadow-2xl",
                        navbar: "hidden md:flex",
                        scrollBox: "rounded-[2rem]",
                        headerTitle: "text-white",
                        headerSubtitle: "text-white/50",
                        profileSectionTitleText: "text-white",
                        formButtonPrimary: "bg-[#39FF14] text-black hover:bg-[#32e012]",
                        breadcrumbsItem: "text-white/50",
                        breadcrumbsSeparator: "text-white/20",
                        userPreviewMainIdentifier: "text-white",
                        userPreviewSecondaryIdentifier: "text-white/50",
                        formFieldLabel: "text-white/70",
                        formFieldInput: "bg-black/20 border-white/10 text-white",
                    }
                }}
            />
        </div>
    );
}
