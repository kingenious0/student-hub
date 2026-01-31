export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-4">
      <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
        <h1 className="font-black uppercase tracking-tighter text-primary">Privacy Protocol</h1>
        <p className="lead">Last Updated: January 2026</p>

        <h3>1. Data Collection</h3>
        <p>
          We collect information you provide directly to us, such as when you create an account, update your profile, make a purchase, or communicate with us.
        </p>

        <h3>2. Location Data</h3>
        <p>
          OMNI uses "Hotspot" technology rather than continuous GPS tracking to protect your privacy. We only record your location when you explicitly select a delivery point or check in at a campus hub.
        </p>

        <h3>3. Payment Security</h3>
        <p>
          All financial transactions are processed through Paystack. We do not store your credit card or mobile money PINs on our servers.
        </p>

        <h3>4. Data Usage</h3>
        <p>
          We use your data to:
        </p>
        <ul>
          <li>Facilitate orders and deliveries.</li>
          <li>Improve our platform and services.</li>
          <li>Detect and prevent fraud.</li>
        </ul>

        <h3>5. Contact Us</h3>
        <p>
          If you have questions about this privacy policy, please contact us at privacy@omni-hub.com.
        </p>
      </div>
    </div>
  );
}
<<<<<<< HEAD
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-4">
      <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
        <h1 className="font-black uppercase tracking-tighter text-primary">Privacy Protocol</h1>
        <p className="lead">Last Updated: January 2026</p>

        <h3>1. Data Collection</h3>
        <p>
          We collect information you provide directly to us, such as when you create an account, update your profile, make a purchase, or communicate with us.
        </p>

        <h3>2. Location Data</h3>
        <p>
          OMNI uses "Hotspot" technology rather than continuous GPS tracking to protect your privacy. We only record your location when you explicitly select a delivery point or check in at a campus hub.
        </p>

        <h3>3. Payment Security</h3>
        <p>
          All financial transactions are processed through Paystack. We do not store your credit card or mobile money PINs on our servers.
        </p>

        <h3>4. Data Usage</h3>
        <p>
          We use your data to:
        </p>
        <ul>
          <li>Facilitate orders and deliveries.</li>
          <li>Improve our platform and services.</li>
          <li>Detect and prevent fraud.</li>
        </ul>

        <h3>5. Contact Us</h3>
        <p>
          If you have questions about this privacy policy, please contact us at privacy@omni-hub.com.
        </p>
=======
'use client';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-neutral-900">Privacy Policy</h1>
          <p className="mt-2 text-neutral-600">Last updated: January 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="prose prose-neutral max-w-none space-y-8 text-neutral-600">
          <section>
            <h2 className="text-xl font-bold text-neutral-900">1. Introduction</h2>
            <p>
              We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900">2. Information We Collect</h2>
            <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li><strong>Personal Data:</strong> Name, email address, phone number, and other identifiable information you voluntarily provide</li>
              <li><strong>Financial Data:</strong> Financial information, such as data related to your payment method, to process your transactions safely and securely</li>
              <li><strong>Data From Interactions:</strong> Information about your interactions with our Service, including transaction history and communication preferences</li>
              <li><strong>Device Data:</strong> Device information, such as your IP address, browser type, and operating system</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900">3. Use of Your Information</h2>
            <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
            <ul className="ml-6 list-disc space-y-2">
              <li>Generate a personal profile about you so that future visits to the Site will be personalized as possible</li>
              <li>Increase the efficiency and operation of the Site</li>
              <li>Monitor and analyze usage and trends to improve your experience with the Site</li>
              <li>Notify you of updates to the Site</li>
              <li>Process your transactions and send related information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900">4. Disclosure of Your Information</h2>
            <p>
              We may share your information in the following situations:
            </p>
            <ul className="ml-6 list-disc space-y-2">
              <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to comply with the law</li>
              <li><strong>Third-Party Service Providers:</strong> We may share your information with parties who perform services for us, such as payment processors</li>
              <li><strong>Business Transfers:</strong> Your information may be transferred as part of a business acquisition or merger</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900">5. Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to protect your personal information. However, perfect security does not exist on the Internet.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900">6. Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at:{' '}
              <a href="mailto:privacy@example.com" className="text-primary-600 hover:text-primary-700">
                privacy@example.com
              </a>
            </p>
          </section>
        </div>
>>>>>>> main
      </div>
    </div>
  );
}
