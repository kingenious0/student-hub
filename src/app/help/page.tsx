'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Send, MessageSquare, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'orders' | 'vendors' | 'account' | 'payments';
}

const faqs: FAQItem[] = [
  {
    category: 'general',
    question: 'What is OMNI?',
    answer:
      'OMNI is an all-in-one campus marketplace that connects students with local vendors and student runners for seamless shopping and delivery within university ecosystems.',
  },
  {
    category: 'general',
    question: 'Is the platform safe?',
    answer:
      'Yes! We employ multiple security measures including encrypted payments via Paystack, verified student vendors, and a unique QR-code based escrow system.',
  },
  {
    category: 'orders',
    question: 'How do payments work?',
    answer:
      'We use a secure escrow system. When you pay, funds are held safely by OMNI. They are only released to the vendor when you scan the QR code upon delivery to confirm you have received your order.',
  },
  {
    category: 'orders',
    question: 'How do I become a runner?',
    answer:
      'Go to the Runner Dashboard from the main menu and toggle your status to "Online". You will need to complete a quick verification process to start receiving delivery missions.',
  },
  {
    category: 'payments',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major payment methods through Paystack, including Mobile Money (MTN, Telecel, AT), debit/credit cards, and bank transfers.',
  },
  {
    category: 'vendors',
    question: 'How can I sell on OMNI?',
    answer:
      'Click on "Become a Vendor" in the navigation menu, fill in your shop details, and submit your application. Our team reviews applications within 24 hours.',
  },
  {
    category: 'account',
    question: 'Can I use OMNI on multiple campuses?',
    answer:
      'Yes! You can switch your location in the header to see vendors and hubs at different supported campuses.',
  },
];

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredFaqs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    alert('Support ticket created. We will contact you shortly.');
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-6xl font-black uppercase tracking-tighter mb-4 text-primary">Help Hub</h1>
          <p className="text-xl text-foreground/60 max-w-2xl">
            Everything you need to know about the OMNI ecosystem. Can't find it here? Contact our elite support squad.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-12">
          {/* FAQ Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex flex-wrap gap-2">
              {['all', 'general', 'orders', 'vendors', 'account', 'payments'].map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setExpandedId(null);
                  }}
                  className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${
                    activeCategory === cat
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-surface border-surface-border hover:border-primary/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredFaqs.map((faq, idx) => (
                <div 
                  key={idx} 
                  className="bg-surface border border-surface-border rounded-2xl overflow-hidden transition-all hover:border-primary/30"
                >
                  <button
                    onClick={() => setExpandedId(expandedId === idx ? null : idx)}
                    className="w-full px-8 py-6 text-left flex justify-between items-center group"
                  >
                    <span className="text-lg font-bold">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedId === idx ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {expandedId === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-8 pb-6 text-foreground/70 leading-relaxed"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-surface border border-surface-border rounded-3xl p-8 glass shadow-xl">
              <h2 className="text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                <MessageSquare className="text-primary" />
                Quick Support
              </h2>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-2 tracking-widest opacity-50">Subject</label>
                  <select className="w-full bg-background border border-surface-border rounded-xl p-4 text-sm focus:border-primary transition-colors outline-none">
                    <option>Order Inquiries</option>
                    <option>Payment Issues</option>
                    <option>Vendor Support</option>
                    <option>Runner Application</option>
                    <option>Bug Report</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-2 tracking-widest opacity-50">Message</label>
                  <textarea 
                    className="w-full bg-background border border-surface-border rounded-xl p-4 text-sm h-32 focus:border-primary transition-colors outline-none resize-none" 
                    placeholder="Describe your issue in detail..."
                    required
                  ></textarea>
                </div>
                <button 
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Transmission
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8">
              <h3 className="font-black uppercase tracking-tight mb-4">Urgent assistance?</h3>
              <p className="text-sm text-foreground/70 mb-6">
                For active orders with immediate issues, use the "Campus Pulse" real-time support feature.
              </p>
              <Link 
                href="/pulse" 
                className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
              >
                Go to Campus Pulse <HelpCircle className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
