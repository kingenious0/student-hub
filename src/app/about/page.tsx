import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-8 text-primary">About OMNI</h1>
        
        <div className="prose prose-lg dark:prose-invert">
          <p className="text-xl font-bold leading-relaxed mb-6">
            OMNI is the ultimate campus ecosystem designed to connect students, vendors, and runners in a seamless digital economy.
          </p>

          <h2 className="text-2xl font-black uppercase tracking-tight mt-12 mb-4">Our Mission</h2>
          <p>
            We aim to digitize the student experience by providing a safe, fast, and reliable platform for commerce and connection. Whether you're looking for late-night food, selling your old textbooks, or starting your own shop, OMNI is your hub.
          </p>

          <h2 className="text-2xl font-black uppercase tracking-tight mt-12 mb-4">The Ecosystem</h2>
          <div className="grid md:grid-cols-3 gap-8 my-8 not-prose">
            <div className="p-6 bg-surface border border-surface-border rounded-2xl">
              <div className="text-4xl mb-4">🛍️</div>
              <h3 className="font-bold text-lg mb-2">Marketplace</h3>
              <p className="text-sm text-foreground/60">Buy and sell products securely with our escrow protection system.</p>
            </div>
            <div className="p-6 bg-surface border border-surface-border rounded-2xl">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="font-bold text-lg mb-2">Vendors</h3>
              <p className="text-sm text-foreground/60">Start your business and reach thousands of students on campus.</p>
            </div>
            <div className="p-6 bg-surface border border-surface-border rounded-2xl">
              <div className="text-4xl mb-4">🏃</div>
              <h3 className="font-bold text-lg mb-2">Runners</h3>
              <p className="text-sm text-foreground/60">Earn money by delivering orders. Be your own boss.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-surface-border">
          <Link href="/" className="inline-flex items-center font-bold text-primary hover:underline">
            ← Back to Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
