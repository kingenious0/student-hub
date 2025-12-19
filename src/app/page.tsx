import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <main className="max-w-4xl mx-auto px-6 py-16 text-center">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Student Hub
          </h1>
          <p className="text-2xl text-purple-200 mb-2">
            The Everything Store for Ghanaian University Students
          </p>
          <p className="text-lg text-purple-300">
            🔥 Flash-Match • 🔒 QR-Escrow • 🏃 Runner Mode
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:border-purple-500/50 transition-all">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-xl font-bold text-white mb-2">Flash-Match</h3>
            <p className="text-purple-200 text-sm">
              Find nearby vendors in seconds. Same hostel, same lecture hall.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:border-purple-500/50 transition-all">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="text-xl font-bold text-white mb-2">QR-Escrow</h3>
            <p className="text-purple-200 text-sm">
              Pay safely. Money held until you scan the QR code at delivery.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:border-purple-500/50 transition-all">
            <div className="text-4xl mb-3">🏃</div>
            <h3 className="text-xl font-bold text-white mb-2">Runner Mode</h3>
            <p className="text-purple-200 text-sm">
              Earn money delivering orders. Gamified with XP and badges.
            </p>
          </div>
        </div>

        {/* CTAs */}
        <SignedIn>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/marketplace"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-purple-500/50"
            >
              🛍️ Browse Marketplace
            </Link>
            <Link
              href="/dashboard/vendor"
              className="px-8 py-4 bg-white/10 backdrop-blur-lg border border-white/20 hover:border-purple-500/50 text-white rounded-xl font-bold text-lg transition-all"
            >
              📊 Vendor Dashboard
            </Link>
          </div>
        </SignedIn>

        <SignedOut>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
            <p className="text-purple-200 mb-4">
              Sign in to start shopping or selling
            </p>
          </div>
        </SignedOut>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8">
          <div>
            <div className="text-3xl font-bold text-white">5min</div>
            <div className="text-sm text-purple-300">Avg. Delivery Time</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">100%</div>
            <div className="text-sm text-purple-300">Scam Protection</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">24/7</div>
            <div className="text-sm text-purple-300">Campus Coverage</div>
          </div>
        </div>
      </main>
    </div>
  );
}

