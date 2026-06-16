import { Shield, Truck, RotateCcw, Compass, HelpCircle } from "lucide-react";

export default function ShippingAndReturnsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-24 px-4 sm:px-6 md:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="mb-12 border-b border-surface-border pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest mb-4">
            🛡️ Escrow Protected Operations
          </div>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-primary mb-4">
            Shipping & Escrow Protocol
          </h1>
          <p className="text-lg md:text-xl text-foreground/60 leading-relaxed">
            How physical trading, delivery hotspots, and our escrow release system work within the LaHustle network.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <span className="bg-surface border border-surface-border px-4 py-2 rounded-full text-xs font-bold uppercase">Escrow Rules v2.1</span>
            <span className="bg-surface border border-surface-border px-4 py-2 rounded-full text-xs font-bold uppercase">Auto-Release: 24 Hours</span>
          </div>
        </div>

        {/* Bento Grid Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Section 1: Hotspot Deliveries */}
          <div className="bg-surface/30 border border-surface-border p-8 rounded-[2rem] flex flex-col justify-between space-y-6">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-6">
                <Truck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-3">1. Campus Hotspots</h2>
              <p className="text-sm leading-relaxed text-foreground/70 font-semibold uppercase tracking-wider">
                We do not deliver to off-campus private coordinates. All deliveries are completed at designated Campus Hotspots (e.g., Hostel lobbies, department libraries, or campus hubs). 
              </p>
            </div>
            <p className="text-xs text-foreground/45">Deliveries are handled by verified Student Runners or directly by the Vendor.</p>
          </div>

          {/* Section 2: Escrow Hold */}
          <div className="bg-surface/30 border border-surface-border p-8 rounded-[2rem] flex flex-col justify-between space-y-6">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-primary mb-3">2. Escrow Protection</h2>
              <p className="text-sm leading-relaxed text-foreground/70 font-semibold uppercase tracking-wider">
                When you make a payment, your money goes into the LaHustle Secure Escrow vault. The vendor is notified to dispatch the order, but they cannot access the funds yet.
              </p>
            </div>
            <p className="text-xs text-foreground/45">Funds are protected from scams until physical verification occurs.</p>
          </div>

          {/* Section 3: QR Code Release */}
          <div className="bg-surface/30 border border-surface-border p-8 rounded-[2rem] flex flex-col justify-between space-y-6 md:col-span-2">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-6">
                  <Compass className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-3">3. Verification & Release</h2>
                <p className="text-sm leading-relaxed text-foreground/70 font-semibold uppercase tracking-wider">
                  Upon meeting the runner at the hotspot, inspect your items. Once satisfied, present your order QR code to the runner. Scanning the QR code instantly verifies the delivery and triggers the escrow vault to release funds to the vendor.
                </p>
              </div>
              <div className="p-6 bg-background/50 rounded-2xl border border-surface-border space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-primary">Escrow Safety Check:</h4>
                <ul className="list-none p-0 space-y-2.5 text-xs font-semibold uppercase text-foreground/70">
                  <li className="flex items-center gap-2">🟢 Inspect before scanning QR</li>
                  <li className="flex items-center gap-2">🟢 Do not share QR code screenshot in advance</li>
                  <li className="flex items-center gap-2">🟢 Auto-releases in 24 hours if no dispute is filed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 4: Returns & Disputes */}
          <div className="bg-surface/30 border border-surface-border p-8 rounded-[2rem] flex flex-col justify-between space-y-6 md:col-span-2">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-6">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-rose-500 mb-3">4. Returns & Escrow Disputes</h2>
              <p className="text-sm leading-relaxed text-foreground/70 font-semibold uppercase tracking-wider mb-6">
                If the product is damaged, incorrect, or doesn't match the description, do NOT share your QR code. Immediately click "Initiate Dispute" on your orders dashboard page.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 bg-background/50 rounded-xl border border-surface-border">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2">Disputed Orders</h4>
                  <p className="text-xs text-foreground/60 font-semibold leading-relaxed">Funds are frozen indefinitely. Our dispute response squad will review photos and coordinate return delivery or a full refund.</p>
                </div>
                <div className="p-5 bg-background/50 rounded-xl border border-surface-border">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2">No-Return Items</h4>
                  <p className="text-xs text-foreground/60 font-semibold leading-relaxed">Perishable food, custom prints, or student tutoring services are non-refundable once the service delivery has commenced.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Help footer */}
        <footer className="mt-12 pt-12 border-t border-surface-border text-center">
          <p className="text-foreground/40 text-sm font-semibold uppercase tracking-wider">
            Need manual dispute arbitration? Reach our operations deck at{" "}
            <a href="mailto:support@LaHustle.com" className="text-primary hover:underline">
              support@LaHustle.com
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
