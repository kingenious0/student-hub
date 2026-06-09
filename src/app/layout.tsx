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

import GlobalMaintenanceGuard from "@/components/admin/GlobalMaintenanceGuard";
import PushNotificationProvider from "@/components/providers/PushNotificationProvider";
import PWARegistration from "@/components/providers/PWARegistration";
import PWAInstallPrompt from "@/components/providers/PWAInstallPrompt";
import CartRecoveryTrigger from "@/components/cart/CartRecoveryTrigger";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LaHustle",
  description: "The everything store for university students",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: { url: '/apple-touch-icon.png', type: 'image/png' },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LaHustle',
    startupImage: '/splash-1290x2796.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" data-theme="lahustle" suppressHydrationWarning>
        <head>
          <link rel="preload" href="/lahustle-icon.svg" as="image" />
          <meta name="theme-color" content="#050505" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="LaHustle" />
          <link rel="apple-touch-startup-image" href="/splash-1290x2796.png" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" />
          <link rel="apple-touch-startup-image" href="/splash-1179x2556.png" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" />
          <link rel="apple-touch-startup-image" href="/splash-1125x2436.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
          <link rel="apple-touch-startup-image" href="/splash-1242x2688.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" />
          <link rel="apple-touch-startup-image" href="/splash-828x1792.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" />
          <link rel="apple-touch-startup-image" href="/splash-750x1334.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
          <link rel="apple-touch-startup-image" href="/splash-2048x2732.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" />
        </head>
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

                          <PWARegistration />
                          <PWAInstallPrompt />
                          <CartRecoveryTrigger />
                          <PushNotificationProvider />
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
