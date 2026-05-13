import React from 'react';
import { RefreshCcw, ShieldCheck, Clock } from 'lucide-react';

const ReturnsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-offwhite py-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-8 md:p-16 shadow-sm border border-gray-100">
        <div className="text-center space-y-4 mb-16">
          <div className="w-20 h-20 bg-gold/10 rounded-3xl flex items-center justify-center mx-auto text-gold mb-6">
            <RefreshCcw size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-charcoal">Returns & Exchanges</h1>
          <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">Simple, Transparent, and Hassle-Free</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 bg-offwhite rounded-[2rem] border border-gray-100 space-y-4">
            <Clock className="text-gold" size={32} />
            <h3 className="text-xl font-heading font-bold">7-Day Return Policy</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              We offer a 7-day 'No Questions Asked' return policy from the date of delivery for all standard products.
            </p>
          </div>
          <div className="p-8 bg-offwhite rounded-[2rem] border border-gray-100 space-y-4">
            <ShieldCheck className="text-gold" size={32} />
            <h3 className="text-xl font-heading font-bold">100% Refund</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Receive a full refund to your original payment method. No hidden charges or processing fees.
            </p>
          </div>
        </div>

        <div className="space-y-12">
          <section className="space-y-4">
            <h2 className="text-2xl font-heading font-bold text-charcoal flex items-center gap-2">
              <span className="w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center text-sm">1</span>
              Initiate Return
            </h2>
            <p className="text-gray-600 pl-10">
              Go to your 'Order History' or contact us on WhatsApp at +91 93715 04182 to initiate a return request.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-heading font-bold text-charcoal flex items-center gap-2">
              <span className="w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center text-sm">2</span>
              Quality Check
            </h2>
            <p className="text-gray-600 pl-10">
              Our delivery partner will pick up the item. It must be in its original condition with all tags and certificates intact.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-heading font-bold text-charcoal flex items-center gap-2">
              <span className="w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center text-sm">3</span>
              Instant Refund
            </h2>
            <p className="text-gray-600 pl-10">
              Once the item reaches our facility and passes the quality check, your refund will be initiated within 24-48 hours.
            </p>
          </section>

          <div className="mt-16 p-8 bg-charcoal rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2">
              <h4 className="text-xl font-heading font-bold">Need help with a return?</h4>
              <p className="text-gray-400 text-sm">Our support team is available 24/7 on WhatsApp.</p>
            </div>
            <button className="bg-gold hover:bg-gold-light text-white px-8 py-3 rounded-full font-bold transition whitespace-nowrap">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPage;
