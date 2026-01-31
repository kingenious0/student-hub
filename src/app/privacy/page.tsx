export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 border-b border-surface-border pb-12">
          <h1 className="text-6xl font-black uppercase tracking-tighter text-primary mb-4">Privacy Protocol</h1>
          <p className="text-xl text-foreground/60">How we safeguard your digital presence within the OMNI ecosystem.</p>
          <div className="mt-8 flex gap-4">
            <span className="bg-surface border border-surface-border px-4 py-2 rounded-full text-xs font-bold uppercase">Version 2.0</span>
            <span className="bg-surface border border-surface-border px-4 py-2 rounded-full text-xs font-bold uppercase">Last Updated: Jan 2026</span>
          </div>
        </div>

        <div className="grid md:grid-cols-1 gap-12 prose prose-invert max-w-none">
          <section className="bg-surface/30 border border-surface-border p-8 rounded-3xl">
            <h2 className="text-2xl font-black uppercase tracking-tight text-primary mt-0">1. Data Sovereignty</h2>
            <p className="text-lg leading-relaxed text-foreground/80">
              We collect information you provide directly—account details, profile updates, and transaction history. Unlike other platforms, we treat your data as your proprietary asset.
            </p>
          </section>

          <section className="bg-surface/30 border border-surface-border p-8 rounded-3xl">
            <h2 className="text-2xl font-black uppercase tracking-tight text-primary mt-0">2. Geo-Fencing & Ghosting</h2>
            <p className="text-lg leading-relaxed text-foreground/80">
              OMNI utilizes "Hotspot" technology. We do not track your continuous GPS coordinates. Location data is only activated when you explicitly place an order or check in at a Campus Hub. When inactive, your digital footprint is essentially "ghosted" from our servers.
            </p>
          </section>

          <section className="bg-surface/30 border border-surface-border p-8 rounded-3xl">
            <h2 className="text-2xl font-black uppercase tracking-tight text-primary mt-0">3. Ironclad Payments</h2>
            <p className="text-lg leading-relaxed text-foreground/80">
              Financial flows are handled via Paystack. OMNI never stores Mobile Money PINs or full CCV codes. Our escrow system ensures that even transaction metadata is encrypted at rest.
            </p>
          </section>

          <section className="bg-surface/30 border border-surface-border p-8 rounded-3xl">
            <h2 className="text-2xl font-black uppercase tracking-tight text-primary mt-0">4. Intelligence Usage</h2>
            <p className="text-lg leading-relaxed text-foreground/80">
              We process data to:
            </p>
            <ul className="list-none space-y-4 p-0">
              <li className="flex items-center gap-3 bg-background/50 p-4 rounded-xl border border-surface-border">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Optimize campus delivery routes for Runners.
              </li>
              <li className="flex items-center gap-3 bg-background/50 p-4 rounded-xl border border-surface-border">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Curate marketplace listings relevant to your specific hostel/campus.
              </li>
              <li className="flex items-center gap-3 bg-background/50 p-4 rounded-xl border border-surface-border">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Anonymized analytics to improve hub load balancing.
              </li>
            </ul>
          </section>

          <section className="bg-surface/30 border border-surface-border p-8 rounded-3xl">
            <h2 className="text-2xl font-black uppercase tracking-tight text-primary mt-0">5. The "Right to Forget"</h2>
            <p className="text-lg leading-relaxed text-foreground/80">
              You can initiate a complete data wipe through your settings. This clears all session history, location logs, and profile data from our primary nodes within 72 hours.
            </p>
          </section>

          <footer className="mt-12 pt-12 border-t border-surface-border text-center">
            <p className="text-foreground/40 text-sm">
              Questions regarding our encryption standards? Contact <span className="text-primary font-bold">privacy@omni-hub.com</span>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
