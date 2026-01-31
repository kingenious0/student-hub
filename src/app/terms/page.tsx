export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 border-b border-surface-border pb-12">
          <h1 className="text-6xl font-black uppercase tracking-tighter text-primary mb-4">Terms of Nexus</h1>
          <p className="text-xl text-foreground/60">The legal framework governing your interactions within the OMNI marketplace.</p>
          <div className="mt-8 flex gap-4">
            <span className="bg-surface border border-surface-border px-4 py-2 rounded-full text-xs font-bold uppercase">Version 1.4</span>
            <span className="bg-surface border border-surface-border px-4 py-2 rounded-full text-xs font-bold uppercase">Effective: Jan 2026</span>
          </div>
        </div>

        <div className="space-y-12">
          <section className="relative pl-12">
            <div className="absolute left-0 top-0 text-4xl font-black text-primary/20 italic">01</div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-primary mb-4">The Agreement</h2>
            <p className="text-lg leading-relaxed text-foreground/80">
              By accessing OMNI, you enter into a binding agreement with the OMNI Network. If you do not agree to these terms, you must immediate terminate your session and delete all local cache associated with the platform.
            </p>
          </section>

          <section className="relative pl-12">
            <div className="absolute left-0 top-0 text-4xl font-black text-primary/20 italic">02</div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-primary mb-4">Account Integrity</h2>
            <p className="text-lg leading-relaxed text-foreground/80">
              You are the sole custodian of your OMNI credentials. Sharing accounts between students is strictly prohibited to maintain the integrity of our trust-score system. Any breach occurring via your account is your legal responsibility.
            </p>
          </section>

          <section className="relative pl-12">
            <div className="absolute left-0 top-0 text-4xl font-black text-primary/20 italic">03</div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-primary mb-4">Vendor & Runner Conduct</h2>
            <p className="text-lg leading-relaxed text-foreground/80">
              Vendors must provide accurate imagery and descriptions. Runners must adhere to campus safety protocols. Failure to deliver or providing substandard service triggers an automatic escrow freeze and potential account blacklisting.
            </p>
          </section>

          <section className="relative pl-12">
            <div className="absolute left-0 top-0 text-4xl font-black text-primary/20 italic">04</div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-primary mb-4">Escrow & Disputes</h2>
            <p className="text-lg leading-relaxed text-foreground/80">
              OMNI acts as a neutral facilitator. Our escrow system holds funds until delivery is verified via QR scan. Disputes are resolved via Campus Hub moderators. Our decision in these matters is final and binding.
            </p>
          </section>

          <section className="relative pl-12">
            <div className="absolute left-0 top-0 text-4xl font-black text-primary/20 italic">05</div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-primary mb-4">Forbidden Trade</h2>
            <p className="text-lg leading-relaxed text-foreground/80">
              The exchange of illegal substances, academic-dishonesty services (ghostwriting/exam leaks), or dangerous hardware is strictly forbidden. We cooperate fully with campus security and law enforcement regarding such activities.
            </p>
          </section>

          <section className="relative pl-12">
            <div className="absolute left-0 top-0 text-4xl font-black text-primary/20 italic">06</div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-primary mb-4">Limitation of Assets</h2>
            <p className="text-lg leading-relaxed text-foreground/80">
              OMNI provides the infrastructure but is not the manufacturer/owner of goods sold. Our liability is limited to the transaction value held in escrow.
            </p>
          </section>

          <div className="bg-surface/50 border border-surface-border p-8 rounded-3xl mt-12">
            <h3 className="text-xl font-bold mb-4 uppercase tracking-widest text-primary">Need clarification?</h3>
            <p className="text-foreground/60 mb-6">
              Our legal department is available for inquiries regarding these terms.
            </p>
            <a 
              href="mailto:legal@omni-hub.com" 
              className="inline-block bg-foreground text-background px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all"
            >
              Contact Legal Office
            </a>
          </div>
        </div>

        <footer className="mt-24 text-center text-foreground/20 text-xs font-bold uppercase tracking-[0.5em]">
          OMNI NETWORK &copy; 2026 // ALL RIGHTS RESERVED
        </footer>
      </div>
    </div>
  );
}
