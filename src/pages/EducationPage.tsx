import React from 'react';
import { BookOpen, Gem, Ruler, Award, CheckCircle2, ChevronRight, Star, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const EducationPage: React.FC = () => {
  const guides = [
    {
      id: 'gold-purity',
      title: 'The Gold Purity Guide',
      subtitle: 'Understanding Karats (14K to 24K)',
      icon: Award,
      color: 'bg-amber-50',
      textColor: 'text-amber-700',
      content: 'Gold purity is measured in Karats (K). 24K is 99.9% pure gold but very soft. 22K is traditional for bridal jewelry, while 18K and 14K offer better durability for diamond settings.',
      tips: ['22K is best for daily wear gold', '18K is ideal for diamond jewelry', 'Check for hallmark stamps']
    },
    {
      id: 'diamond-4cs',
      title: 'Diamond Quality (4Cs)',
      subtitle: 'Cut, Clarity, Color & Carat',
      icon: Gem,
      color: 'bg-blue-50',
      textColor: 'text-blue-700',
      content: 'The 4Cs determine the value of a diamond. Cut affects brilliance, Clarity measures internal flaws, Color ranges from colorless to yellow, and Carat is the weight.',
      tips: ['Focus on "Excellent" cut first', 'VVS/VS clarity is eye-clean', 'IGI/GIA certification is a must']
    },
    {
      id: 'size-guide',
      title: 'Finding Your Size',
      subtitle: 'Rings, Bangles & Necklaces',
      icon: Ruler,
      color: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      content: 'A perfect fit ensures comfort and safety. We provide detailed measurement techniques for rings and bangles to ensure you get it right the first time.',
      tips: ['Measure at the end of the day', 'Use a strip of paper or string', 'Account for knuckle width']
    }
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF7] py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-20">
        
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 text-gold rounded-full text-xs font-black uppercase tracking-widest">
            <BookOpen size={14} />
            Arham Academy
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-charcoal tracking-tight">
            The Art of <span className="text-gold">Jewellery</span> Buying
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            Investing in fine jewellery is a journey of heritage and heart. Our expert guides help you make informed decisions with confidence and clarity.
          </p>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {guides.map((guide) => (
            <div key={guide.id} className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
              <div className={`w-16 h-16 ${guide.color} ${guide.textColor} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                <guide.icon size={32} />
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{guide.subtitle}</p>
                <h3 className="text-2xl font-heading font-bold text-charcoal">{guide.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{guide.content}</p>
                
                <div className="pt-6 space-y-3">
                  {guide.tips.map((tip, index) => (
                    <div key={index} className="flex items-center gap-3 text-xs font-bold text-charcoal">
                      <CheckCircle2 size={14} className="text-gold" />
                      {tip}
                    </div>
                  ))}
                </div>

                <button className="w-full mt-8 py-4 border-2 border-charcoal/5 rounded-2xl font-bold text-charcoal hover:bg-charcoal hover:text-white transition-all flex items-center justify-center gap-2 group/btn">
                  Read Full Guide
                  <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Certification Section */}
        <div className="bg-charcoal text-white rounded-[4rem] p-12 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl -mr-48 -mt-48" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gold/20 rounded-xl">
                  <ShieldCheck className="text-gold" size={32} />
                </div>
                <h2 className="text-3xl md:text-5xl font-heading font-bold">Absolute Trust</h2>
              </div>
              <p className="text-white/60 text-lg leading-relaxed">
                Every piece at Arham Ornaments undergoes rigorous quality checks. We only use certified diamonds and hallmarked gold, ensuring your investment is protected for generations.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <p className="text-3xl font-heading font-bold text-gold">100%</p>
                  <p className="text-xs font-black uppercase tracking-widest text-white/40">BIS Hallmarked</p>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-heading font-bold text-gold">IGI/GIA</p>
                  <p className="text-xs font-black uppercase tracking-widest text-white/40">Certified Diamonds</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 rounded-[3rem] p-8 border border-white/10 backdrop-blur-sm space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xl">Expert Consultation</h4>
                <Star className="text-gold" fill="currentColor" size={20} />
              </div>
              <p className="text-white/50 text-sm">Need personalized advice? Our master gemologists are available for virtual consultations.</p>
              <Link to="/support" className="block w-full bg-gold text-white py-4 rounded-full font-bold text-center hover:bg-amber-600 transition shadow-lg shadow-gold/20">
                Book a Free Session
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EducationPage;
