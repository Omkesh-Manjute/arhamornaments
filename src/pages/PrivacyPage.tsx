import React from 'react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-offwhite py-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-8 md:p-16 shadow-sm border border-gray-100">
        <div className="text-center space-y-4 mb-16">
          <div className="w-20 h-20 bg-gold/10 rounded-3xl flex items-center justify-center mx-auto text-gold mb-6">
            <Shield size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-charcoal">Privacy Policy</h1>
          <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">Last Updated: May 2024</p>
        </div>

        <div className="space-y-12">
          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-gold">
              <FileText size={24} />
              <h2 className="text-2xl font-heading font-bold">Introduction</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              At Arham Ornaments, your privacy is our top priority. This Privacy Policy outlines how we collect, use, and protect your personal information when you visit our website or make a purchase. By using our services, you agree to the terms described in this policy.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-gold">
              <Eye size={24} />
              <h2 className="text-2xl font-heading font-bold">Information We Collect</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-offwhite rounded-2xl border border-gray-100">
                <h4 className="font-bold mb-2">Personal Details</h4>
                <p className="text-sm text-gray-500">Name, email, phone number, and shipping address when you place an order or register.</p>
              </div>
              <div className="p-6 bg-offwhite rounded-2xl border border-gray-100">
                <h4 className="font-bold mb-2">Payment Data</h4>
                <p className="text-sm text-gray-500">Securely processed through encrypted gateways. We never store your card details on our servers.</p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-gold">
              <Lock size={24} />
              <h2 className="text-2xl font-heading font-bold">How We Protect Data</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              We implement a variety of security measures to maintain the safety of your personal information. We use state-of-the-art 256-bit SSL encryption for all transactions. Your data is stored on secure servers and access is limited to authorized personnel only.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 pl-4">
              <li>Regular security audits and updates.</li>
              <li>Encrypted storage for sensitive information.</li>
              <li>Strict internal data access policies.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-heading font-bold text-charcoal">Cookies Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We use cookies to understand and save your preferences for future visits and compile aggregate data about site traffic and site interaction so that we can offer better site experiences and tools in the future.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-heading font-bold text-charcoal">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions regarding this privacy policy, you may contact our Data Protection Officer at:
            </p>
            <div className="p-6 border-l-4 border-gold bg-offwhite rounded-r-2xl">
              <p className="font-bold">Arham Ornaments Support</p>
              <p className="text-sm text-gray-500">Email: privacy@arham.com</p>
              <p className="text-sm text-gray-500">Phone: +91 93715 04182</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
