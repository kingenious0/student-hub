export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-4">
      <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
        <h1 className="font-black uppercase tracking-tighter text-primary">Terms of Service</h1>
        <p className="lead">Effective Date: January 2026</p>

        <h3>1. Acceptance of Terms</h3>
        <p>
          By accessing or using OMNI, you agree to be bound by these Terms of Service and all applicable laws and regulations.
        </p>

        <h3>2. User Accounts</h3>
        <p>
          You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
        </p>

        <h3>3. Vendor & Runner Rules</h3>
        <p>
          Vendors and Runners must adhere to our strict quality and community guidelines. Failure to deliver orders or providing substandard service may result in account suspension.
        </p>

        <h3>4. Prohibited Items</h3>
        <p>
          The sale of illegal, unsafe, or academic-dishonesty related items (e.g., plagiarized papers) is strictly prohibited on OMNI.
        </p>

        <h3>5. Limitation of Liability</h3>
        <p>
          OMNI is a facilitator of transactions. We are not liable for the quality of goods or services provided by third-party vendors, though we facilitate dispute resolution through our escrow system.
        </p>
      </div>
    </div>
  );
}
<<<<<<< HEAD
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-4">
      <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
        <h1 className="font-black uppercase tracking-tighter text-primary">Terms of Service</h1>
        <p className="lead">Effective Date: January 2026</p>

        <h3>1. Acceptance of Terms</h3>
        <p>
          By accessing or using OMNI, you agree to be bound by these Terms of Service and all applicable laws and regulations.
        </p>

        <h3>2. User Accounts</h3>
        <p>
          You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
        </p>

        <h3>3. Vendor & Runner Rules</h3>
        <p>
          Vendors and Runners must adhere to our strict quality and community guidelines. Failure to deliver orders or providing substandard service may result in account suspension.
        </p>

        <h3>4. Prohibited Items</h3>
        <p>
          The sale of illegal, unsafe, or academic-dishonesty related items (e.g., plagiarized papers) is strictly prohibited on OMNI.
        </p>

        <h3>5. Limitation of Liability</h3>
        <p>
          OMNI is a facilitator of transactions. We are not liable for the quality of goods or services provided by third-party vendors, though we facilitate dispute resolution through our escrow system.
        </p>
=======
'use client';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-neutral-900">Terms & Conditions</h1>
          <p className="mt-2 text-neutral-600">Last updated: January 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="prose prose-neutral max-w-none space-y-8 text-neutral-600">
          <section>
            <h2 className="text-xl font-bold text-neutral-900">1. Agreement to Terms</h2>
            <p>
              By accessing and using this marketplace platform (&quot;Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on our Service for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on the Service</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900">3. Disclaimer</h2>
            <p>
              The materials on our Service are provided on an &apos;as is&apos; basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900">4. Limitations</h2>
            <p>
              In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the Service, even if we or our authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900">5. Accuracy of Materials</h2>
            <p>
              The materials appearing on our Service could include technical, typographical, or photographic errors. We do not warrant that any of the materials on our Service are accurate, complete, or current. We may make changes to the materials contained on our Service at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900">6. Links</h2>
            <p>
              We have not reviewed all of the sites linked to our website and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site. Use of any such linked website is at the user&apos;s own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900">7. Modifications</h2>
            <p>
              We may revise these terms of service for our Service at any time without notice. By using this Service, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900">8. Contact Information</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at:{' '}
              <a href="mailto:support@example.com" className="text-primary-600 hover:text-primary-700">
                support@example.com
              </a>
            </p>
          </section>
        </div>
>>>>>>> main
      </div>
    </div>
  );
}
