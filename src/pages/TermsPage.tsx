import React from 'react';
import { Gavel, Scale, AlertCircle, RefreshCcw } from 'lucide-react';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-offwhite py-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-8 md:p-16 shadow-sm border border-gray-100">
        <div className="text-center space-y-4 mb-16">
          <div className="w-20 h-20 bg-gold/10 rounded-3xl flex items-center justify-center mx-auto text-gold mb-6">
            <Gavel size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-charcoal">Terms & Conditions</h1>
          <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">Last Updated: May 2024</p>
        </div>

        <div className="prose prose-gold max-w-none space-y-12">
          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-gold">
              <Scale size={24} />
              <h2 className="text-2xl font-heading font-bold m-0">1. Terms of Use</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Welcome to Arham Ornaments. By accessing this website, you are agreeing to be bound by these web site Terms and Conditions of Use, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-heading font-bold text-charcoal">2. Purchase & Pricing</h2>
            <p className="text-gray-600 leading-relaxed">
              All prices listed on the website are inclusive of GST unless otherwise stated. While we strive to ensure all pricing and information are accurate, errors may occur. If we discover an error in the price of any goods which you have ordered, we will inform you of this as soon as possible.
            </p>
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex gap-4">
              <AlertCircle className="text-amber-600 flex-shrink-0" size={24} />
              <p className="text-sm text-amber-800">
                Gold and Diamond prices are subject to market fluctuations and may change daily. The price at the time of your order confirmation will be the final price.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-gold">
              <RefreshCcw size={24} />
              <h2 className="text-2xl font-heading font-bold m-0">3. Return & Exchange</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              We offer a 7-day return policy for standard jewellery items. The product must be returned in its original packaging, unused, and with all certificates/tags intact.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 pl-4">
              <li>Custom-made jewellery is not eligible for return.</li>
              <li>Gold coins and bars are not eligible for return.</li>
              <li>Refunds will be processed to the original payment method within 10-15 business days.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-heading font-bold text-charcoal">4. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              The contents of this website, including designs, text, and images, are the property of Arham Ornaments and are protected by copyright and intellectual property laws. Any unauthorized use is strictly prohibited.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-heading font-bold text-charcoal">5. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              Any claim relating to Arham Ornaments's web site shall be governed by the laws of India without regard to its conflict of law provisions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
