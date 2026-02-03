import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import OnboardingCheck from "@/components/providers/OnboardingCheck";
import { AdminProvider } from "@/context/AdminContext";
import { ModalProvider } from "@/context/ModalContext";
import QueryProvider from "@/components/providers/QueryProvider";
import GhostEditToggle from "@/components/admin/GhostEditToggle";
import ImpersonationBanner from "@/components/admin/ImpersonationBanner";
import BanOverlay from "@/components/admin/BanOverlay";
import Script from "next/script";
import LocationProvider from "@/components/location/DynamicLocationProvider";
import CampusGuard from "@/components/layout/CampusGuard";
import { CartProvider } from "@/context/CartContext";
import { SecurityProvider } from "@/context/SecurityContext";
import "./globals.css";
import WelcomeModal from "@/components/alpha/WelcomeModal";
import InsightUplink from "@/components/alpha/InsightUplink";
import GlobalMaintenanceGuard from "@/components/admin/GlobalMaintenanceGuard";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OMNI",
  description: "The everything store for university students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" data-theme="omni" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-300`}
        >
          <ThemeProvider>
            <AdminProvider>
              <LocationProvider>
                <QueryProvider>
                  <CartProvider>
                    <SecurityProvider>
                      <ModalProvider>
                        <GlobalMaintenanceGuard>
                          <OnboardingCheck />
                          <Navbar />
                          <ImpersonationBanner />
                          <BanOverlay />
                          <CampusGuard>
                            {children}
                          </CampusGuard>
                          <Footer />
                          <GhostEditToggle />
                          <WelcomeModal />
                          <InsightUplink />
                        </GlobalMaintenanceGuard>
                        <Toaster richColors position="top-center" theme="dark" />
                      </ModalProvider>
                    </SecurityProvider>
                  </CartProvider>
                </QueryProvider>
              </LocationProvider>
            </AdminProvider>
          </ThemeProvider>
          <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
        </body>
      </html>
    </ClerkProvider >
  );
}
