import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import OnboardingCheck from "@/components/providers/OnboardingCheck";
import { CartProvider } from "@/context/CartContext";
import { AdminProvider } from "@/context/AdminContext";
import { ModalProvider } from "@/context/ModalContext";
import GhostEditToggle from "@/components/admin/GhostEditToggle";
import ImpersonationBanner from "@/components/admin/ImpersonationBanner";
import BanOverlay from "@/components/admin/BanOverlay";
import Script from "next/script";
import "./globals.css";

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
              <ModalProvider>
                <CartProvider>
                  <OnboardingCheck />
                  <Navbar />
                  <ImpersonationBanner />
                  <BanOverlay />
                  {children}
                  <Footer />
                  <GhostEditToggle />
                </CartProvider>
              </ModalProvider>
            </AdminProvider>
          </ThemeProvider>
          <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
        </body>
      </html>
    </ClerkProvider >
  );
}
