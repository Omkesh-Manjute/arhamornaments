import React from 'react';
import { Sparkles, Heart, Shield, Users, Clock } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <img 
          src="/images/about_showroom.png" 
          className="absolute inset-0 w-full h-full object-cover brightness-50" 
          alt="Our Showroom" 
        />
        <div className="relative z-10 text-center space-y-4 px-4">
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-white tracking-tight">Our Legacy</h1>
          <p className="text-gold text-lg uppercase tracking-[0.4em] font-medium">Crafting Excellence Since 1985</p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="text-gold uppercase tracking-widest text-xs font-bold">The Arham Story</span>
              <h2 className="text-4xl font-heading font-bold text-charcoal leading-tight">
                A Journey of Heritage, <br /> Art, and Pure Gold.
              </h2>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              Founded in 1985, ARHAM ORNAMENTS began with a simple vision: to create jewellery that transcends time. What started as a small workshop of master artisans has grown into a prestigious destination for those seeking the finest craftsmanship in the world of jewellery.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Every piece in our collection is a labor of love, meticulously designed and handcrafted using techniques passed down through generations, blended with modern innovation to create something truly extraordinary.
            </p>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
              <img src="/images/about_craftsmanship.png" className="w-full h-full object-cover" alt="Our Craft" />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-charcoal text-white p-10 rounded-[2rem] shadow-xl border border-gold/20 hidden lg:block">
              <p className="text-3xl font-heading font-bold text-gold">35+</p>
              <p className="text-xs uppercase tracking-widest font-medium opacity-60">Years of Experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-offwhite px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-heading font-bold text-charcoal">Our Core Values</h2>
            <div className="w-24 h-1 bg-gold/30 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Sparkles, title: "Uncompromising Quality", desc: "We use only the highest grade of precious metals and ethically sourced stones." },
              { icon: Shield, title: "Heritage & Trust", desc: "Our reputation is built on decades of transparency and authentic hallmarked jewellery." },
              { icon: Users, title: "Customer Centricity", desc: "We believe in building lifelong relationships through personalized service and care." }
            ].map((value, i) => (
              <div key={i} className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100 text-center space-y-6 hover:shadow-xl transition-shadow group">
                <div className="w-16 h-16 bg-charcoal text-gold rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <value.icon size={32} />
                </div>
                <h3 className="text-xl font-heading font-bold text-charcoal">{value.title}</h3>
                <p className="text-gray-500 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-charcoal text-white px-4 md:px-8 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="grid grid-cols-12 h-full">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="border-r border-gold h-full" />
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center relative z-10">
          {[
            { label: "Products Created", value: "15K+" },
            { label: "Happy Clients", value: "50K+" },
            { label: "Awards Won", value: "24" },
            { label: "Artisans", value: "80+" }
          ].map((stat, i) => (
            <div key={i} className="space-y-2">
              <p className="text-4xl md:text-5xl font-heading font-bold text-gold">{stat.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section Placeholder */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <span className="text-gold uppercase tracking-widest text-xs font-bold">The Minds Behind Arham</span>
          <h2 className="text-4xl font-heading font-bold text-charcoal">Visionary Leadership</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="aspect-video rounded-[3rem] overflow-hidden bg-gray-100 border border-gray-200">
            <img src="/images/heritage_portrait.png" className="w-full h-full object-cover" alt="Founder" />
          </div>
          <div className="space-y-6">
            <h3 className="text-3xl font-heading font-bold text-charcoal">Message from our Founder</h3>
            <p className="text-gray-600 italic text-xl leading-relaxed">
              "Jewellery is not just an accessory; it's an emotion, a celebration of life's most precious moments. At Arham, we don't just sell ornaments; we deliver legacies."
            </p>
            <div>
              <p className="font-bold text-lg">Praveen Jain</p>
              <p className="text-gold text-sm uppercase tracking-widest">Founder & CEO</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
