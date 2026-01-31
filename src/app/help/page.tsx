import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-8 text-primary">Help & Support</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="group bg-surface border border-surface-border rounded-xl p-4 cursor-pointer">
                  <summary className="font-bold flex justify-between items-center">
                    How do payments work?
                    <span className="transform group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-4 text-sm text-foreground/70">
                    We use a secure escrow system. When you pay, funds are held safely. They are only released to the vendor when you scan the QR code upon delivery.
                  </p>
                </details>
                <details className="group bg-surface border border-surface-border rounded-xl p-4 cursor-pointer">
                  <summary className="font-bold flex justify-between items-center">
                    How do I become a runner?
                    <span className="transform group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-4 text-sm text-foreground/70">
                    Go to the Runner Dashboard from the menu and toggle your status to "Online". You'll start receiving delivery missions nearby.
                  </p>
                </details>
                <details className="group bg-surface border border-surface-border rounded-xl p-4 cursor-pointer">
                  <summary className="font-bold flex justify-between items-center">
                    Is OMNI available on all campuses?
                    <span className="transform group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-4 text-sm text-foreground/70">
                    Currently, we are in Alpha phase at select campuses. Check the location picker to see if your area is supported.
                  </p>
                </details>
              </div>
            </section>
          </div>

          <div className="bg-surface border border-surface-border rounded-2xl p-8 h-fit">
            <h2 className="text-xl font-black uppercase tracking-tight mb-4">Contact Support</h2>
            <p className="text-sm text-foreground/60 mb-6">
              Need assistance with an order or account issue? Our support team is here to help.
            </p>
            <form className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-2">Subject</label>
                <select className="w-full bg-background border border-surface-border rounded-lg p-3 text-sm">
                  <option>Order Issue</option>
                  <option>Payment Problem</option>
                  <option>Vendor Inquiry</option>
                  <option>Report a Bug</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-2">Message</label>
                <textarea className="w-full bg-background border border-surface-border rounded-lg p-3 text-sm h-32" placeholder="Describe your issue..."></textarea>
              </div>
              <button className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest py-3 rounded-lg hover:opacity-90 transition-opacity">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
<<<<<<< HEAD
import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-8 text-primary">Help & Support</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="group bg-surface border border-surface-border rounded-xl p-4 cursor-pointer">
                  <summary className="font-bold flex justify-between items-center">
                    How do payments work?
                    <span className="transform group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-4 text-sm text-foreground/70">
                    We use a secure escrow system. When you pay, funds are held safely. They are only released to the vendor when you scan the QR code upon delivery.
                  </p>
                </details>
                <details className="group bg-surface border border-surface-border rounded-xl p-4 cursor-pointer">
                  <summary className="font-bold flex justify-between items-center">
                    How do I become a runner?
                    <span className="transform group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-4 text-sm text-foreground/70">
                    Go to the Runner Dashboard from the menu and toggle your status to "Online". You'll start receiving delivery missions nearby.
                  </p>
                </details>
                <details className="group bg-surface border border-surface-border rounded-xl p-4 cursor-pointer">
                  <summary className="font-bold flex justify-between items-center">
                    Is OMNI available on all campuses?
                    <span className="transform group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-4 text-sm text-foreground/70">
                    Currently, we are in Alpha phase at select campuses. Check the location picker to see if your area is supported.
                  </p>
                </details>
              </div>
            </section>
          </div>

          <div className="bg-surface border border-surface-border rounded-2xl p-8 h-fit">
            <h2 className="text-xl font-black uppercase tracking-tight mb-4">Contact Support</h2>
            <p className="text-sm text-foreground/60 mb-6">
              Need assistance with an order or account issue? Our support team is here to help.
            </p>
            <form className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-2">Subject</label>
                <select className="w-full bg-background border border-surface-border rounded-lg p-3 text-sm">
                  <option>Order Issue</option>
                  <option>Payment Problem</option>
                  <option>Vendor Inquiry</option>
                  <option>Report a Bug</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-2">Message</label>
                <textarea className="w-full bg-background border border-surface-border rounded-lg p-3 text-sm h-32" placeholder="Describe your issue..."></textarea>
              </div>
              <button className="w-full bg-primary text-primary-foreground font-black uppercase tracking-widest py-3 rounded-lg hover:opacity-90 transition-opacity">
                Send Message
              </button>
            </form>
=======
'use client';

import { useState } from 'react';

/**
 * Help & Support Page
 * - FAQ
 * - Contact form
 * - Knowledge base
 */

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'orders' | 'vendors' | 'account' | 'payments';
}

const faqs: FAQItem[] = [
  {
    category: 'general',
    question: 'What is this marketplace?',
    answer:
      'Our marketplace is a platform connecting students with local vendors offering products and services. We provide a safe, convenient way to shop on your campus.',
  },
  {
    category: 'general',
    question: 'Is the platform safe?',
    answer:
      'Yes! We employ multiple security measures including encrypted payments, verified vendors, and user protection protocols.',
  },
  {
    category: 'orders',
    question: 'How do I place an order?',
    answer:
      'Browse products, add items to your cart, and proceed to checkout. You can choose pickup or delivery as your fulfillment option.',
  },
  {
    category: 'orders',
    question: 'How long does delivery take?',
    answer: 'Delivery times vary by vendor, typically between 30 minutes to 2 hours depending on location and current demand.',
  },
  {
    category: 'payments',
    question: 'What payment methods do you accept?',
    answer: 'We accept payments via Paystack, supporting all major debit cards, mobile money (MTN, Vodafone, Airtel), and bank transfers.',
  },
  {
    category: 'payments',
    question: 'Is my payment information secure?',
    answer:
      'All payments are processed through Paystack, a PCI-DSS compliant payment gateway. We never store your full card details.',
  },
  {
    category: 'account',
    question: 'How do I create an account?',
    answer:
      'Click the Sign Up button, enter your email, and set a password. You can also sign up with your university email.',
  },
  {
    category: 'vendors',
    question: 'How can I become a vendor?',
    answer:
      'Visit the "Become a Vendor" section, fill in your shop details, and submit your application. Our team will review and approve within 24 hours.',
  },
];

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState<'general' | 'orders' | 'vendors' | 'account' | 'payments'>('general');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredFaqs = faqs.filter(faq => faq.category === activeCategory);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Submit to support email
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Thank you! We will get back to you soon.');
      setContactForm({ name: '', email: '', message: '' });
    } catch (error) {
      alert('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-neutral-900">Help & Support</h1>
          <p className="mt-2 text-neutral-600">Find answers and get support from our team</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-neutral-200 bg-white p-6">
              <h2 className="mb-6 text-2xl font-bold text-neutral-900">Frequently Asked Questions</h2>

              {/* Category Filter */}
              <div className="mb-6 flex flex-wrap gap-2">
                {['general', 'orders', 'vendors', 'account', 'payments'].map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      setActiveCategory(category as any);
                      setExpandedId(null);
                    }}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      activeCategory === category
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>

              {/* FAQ Items */}
              <div className="space-y-3">
                {filteredFaqs.map((faq, idx) => (
                  <div key={idx} className="border border-neutral-200 rounded-lg">
                    <button
                      onClick={() => setExpandedId(expandedId === idx ? null : idx)}
                      className="w-full px-4 py-4 text-left font-medium text-neutral-900 hover:bg-neutral-50 flex justify-between items-center"
                    >
                      {faq.question}
                      <span className="text-neutral-500">{expandedId === idx ? '−' : '+'}</span>
                    </button>
                    {expandedId === idx && (
                      <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-4 text-neutral-600">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-neutral-200 bg-white p-6">
              <h3 className="mb-4 text-xl font-bold text-neutral-900">Still need help?</h3>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                    className="form-input"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                    className="form-input"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Message</label>
                  <textarea
                    value={contactForm.message}
                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                    className="form-input h-32 resize-none"
                    placeholder="Describe your issue..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary w-full"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>

              {/* Quick Links */}
              <div className="mt-6 border-t border-neutral-200 pt-6">
                <h4 className="mb-3 font-medium text-neutral-900">Quick Links</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="/" className="text-primary-600 hover:text-primary-700">
                      ← Back to Home
                    </a>
                  </li>
                  <li>
                    <a href="/terms" className="text-primary-600 hover:text-primary-700">
                      Terms & Conditions
                    </a>
                  </li>
                  <li>
                    <a href="/privacy" className="text-primary-600 hover:text-primary-700">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="mailto:support@example.com" className="text-primary-600 hover:text-primary-700">
                      Email Us
                    </a>
                  </li>
                </ul>
              </div>
            </div>
>>>>>>> main
          </div>
        </div>
      </div>
    </div>
  );
}
