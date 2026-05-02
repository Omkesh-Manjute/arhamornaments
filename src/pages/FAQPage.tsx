import React, { useState } from 'react';
import { ChevronDown, Search, MessageCircle } from 'lucide-react';

const FAQPage: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs = [
    {
      category: "Ordering & Payment",
      questions: [
        { q: "How can I track my order?", a: "Once your order is shipped, you will receive a WhatsApp message and email with the tracking ID and link to our delivery partner's portal." },
        { q: "What payment methods do you accept?", a: "We accept all major Credit/Debit cards, UPI (PhonePe, Google Pay), Net Banking, and offer Interest-Free EMI options on select products." },
        { q: "Is it safe to buy gold online?", a: "Absolutely. Every shipment is fully insured until it reaches your doorstep. We use secure payment gateways and discreet, tamper-proof packaging." }
      ]
    },
    {
      category: "Product & Quality",
      questions: [
        { q: "Are your diamonds certified?", a: "Yes, all our diamonds are certified by international laboratories like GIA, IGI, or SGL. Certificates are provided with every purchase." },
        { q: "Is the gold hallmarked?", a: "Every single piece of gold jewellery at Arham Ornaments is BIS Hallmarked, ensuring the purity and quality of the gold." },
        { q: "Do you offer customization?", a: "Yes, we specialize in custom-made jewellery. You can share your designs on WhatsApp, and our master artisans will bring them to life." }
      ]
    },
    {
      category: "Shipping & Returns",
      questions: [
        { q: "What is your return policy?", a: "We offer a 7-day 'No Questions Asked' return policy for all standard products in their original condition with tags and certificates." },
        { q: "Do you ship internationally?", a: "Currently, we ship across India. For international orders, please contact our support team on WhatsApp for special arrangements." },
        { q: "How long does delivery take?", a: "Standard delivery takes 3-5 business days. Custom orders may take 10-15 business days depending on the complexity of the design." }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-offwhite py-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-charcoal">Frequently Asked Questions</h1>
          <p className="text-gray-500 text-lg">Everything you need to know about Arham Ornaments</p>
          <div className="relative max-w-xl mx-auto mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search for questions..." 
              className="w-full pl-12 pr-6 py-4 rounded-full border border-gray-200 focus:ring-2 focus:ring-gold outline-none shadow-sm"
            />
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-12">
          {faqs.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-6">
              <h2 className="text-xl font-heading font-bold text-gold uppercase tracking-widest pl-4 border-l-4 border-gold">
                {group.category}
              </h2>
              <div className="space-y-4">
                {group.questions.map((faq, idx) => {
                  const globalIdx = groupIdx * 10 + idx;
                  const isOpen = activeIndex === globalIdx;
                  return (
                    <div 
                      key={idx} 
                      className="bg-white rounded-3xl border border-gray-100 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <button 
                        onClick={() => setActiveIndex(isOpen ? null : globalIdx)}
                        className="w-full px-8 py-6 flex items-center justify-between text-left"
                      >
                        <span className="font-heading font-bold text-lg text-charcoal">{faq.q}</span>
                        <ChevronDown className={`text-gold transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={20} />
                      </button>
                      <div className={`px-8 transition-all duration-300 ease-in-out ${isOpen ? 'pb-8 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                        <p className="text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="bg-charcoal rounded-[3rem] p-12 text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <h3 className="text-3xl font-heading font-bold text-white">Still have questions?</h3>
          <p className="text-gray-400">Our dedicated support team is here to help you 24/7.</p>
          <button className="inline-flex items-center gap-3 bg-gold text-white px-8 py-4 rounded-full font-bold hover:bg-gold-light transition shadow-lg">
            <MessageCircle size={24} />
            Chat with Experts
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
