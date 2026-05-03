import React, { useState, useEffect } from 'react';
import { X, Gift, Wallet, Coins, Gem, Banknote, Check } from 'lucide-react';
import { useUser } from '../context/UserContext';

const LuckyWheel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [winningSegment, setWinningSegment] = useState<any>(null);
  
  const { isLoggedIn, login, addWinnings, user } = useUser();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    agreed: false
  });

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-lucky-wheel', handleOpen);
    return () => window.removeEventListener('open-lucky-wheel', handleOpen);
  }, []);

  const segments = [
    { label: '₹500', sub: 'Wallet', value: 500, type: 'cash' },
    { label: '2 Gram', sub: 'Gold Coin', value: 0, type: 'item' },
    { label: '₹250', sub: 'Wallet', value: 250, type: 'cash' },
    { label: 'Diamond', sub: 'Pendant', value: 0, type: 'item' },
    { label: '₹10K', sub: 'Diamond Pendant', value: 0, type: 'item' },
    { label: 'Diamond', sub: 'Pendant', value: 0, type: 'item' },
    { label: '₹250', sub: 'Wallet', value: 250, type: 'cash' },
    { label: 'Diamond', sub: 'Pendant', value: 0, type: 'item' },
  ];

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    const extraDegrees = 1800 + Math.floor(Math.random() * 360);
    const newRotation = rotation + extraDegrees;
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const actualDegree = (newRotation % 360);
      const segmentSize = 360 / segments.length;
      const index = Math.floor(((360 - (actualDegree % 360)) % 360) / segmentSize);
      const winner = segments[index];
      
      setWinningSegment(winner);
      setShowResult(true);
      if (winner.type === 'cash') addWinnings(winner.value);
    }, 5000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.phone && formData.agreed) {
      login(formData.name, formData.email, formData.phone);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-hidden">
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden max-w-4xl w-full max-h-[95vh] relative flex flex-col md:flex-row shadow-2xl overflow-y-auto">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2 bg-gray-100/80 backdrop-blur-md hover:bg-gray-200 rounded-full transition shadow-lg"
        >
          <X size={20} />
        </button>

        {/* Left Side: The Wheel Area (White/Teal Theme) */}
        <div className="flex-1 bg-[#E0F7F9] p-6 md:p-12 flex flex-col items-center justify-center space-y-6 md:space-y-8 min-h-[350px] md:min-h-[450px]">
          <div className="text-center space-y-1">
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#40C0CB]">Sign Up</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#0D4449]">PLAY & WIN</h2>
            <p className="text-[#5A8D92] text-[10px] md:text-xs">Assured rewards worth up to <span className="font-bold text-charcoal">₹500</span></p>
          </div>

          <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
            {/* LED Glowing Rim */}
            <div className="absolute inset-0 rounded-full border-[8px] md:border-[12px] border-[#0D4449] shadow-[0_0_50px_rgba(64,192,203,0.4)] z-0"></div>
            
            {/* LED Lights (Dynamic) */}
            {[...Array(24)].map((_, i) => (
              <div 
                key={i}
                className={`absolute w-1.5 h-1.5 md:w-2 md:h-2 rounded-full z-20 transition-all duration-300 ${isSpinning ? 'animate-pulse scale-150' : ''}`}
                style={{
                  transform: `rotate(${i * (360 / 24)}deg) translateY(-115px) sm:translateY(-145px) md:translateY(-170px)`,
                  backgroundColor: isSpinning ? (i % 2 === 0 ? '#FFFFFF' : '#40C0CB') : '#40C0CB',
                  boxShadow: '0 0 10px rgba(255,255,255,0.9)',
                  opacity: isSpinning ? (Math.random() > 0.5 ? 1 : 0.5) : 1
                }}
              />
            ))}

            {/* Premium Pointer */}
            <div className={`absolute -top-4 md:-top-6 left-1/2 -translate-x-1/2 z-30 w-12 h-12 md:w-16 md:h-16 flex flex-col items-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] ${isSpinning ? 'animate-bounce' : ''}`}>
               <div className="w-8 h-10 md:w-10 md:h-14 bg-gradient-to-b from-gold via-yellow-400 to-gold rounded-b-xl md:rounded-b-2xl relative border-x border-white/20">
                 <div className="absolute top-1 md:top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full shadow-[0_0_10px_white] animate-pulse"></div>
                 <div className="absolute -bottom-1.5 md:-bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] md:border-l-[12px] border-l-transparent border-r-[8px] md:border-r-[12px] border-r-transparent border-t-[15px] md:border-t-[20px] border-t-gold"></div>
               </div>
            </div>

            {/* The Wheel Image */}
            <div 
              className="w-[92%] h-[92%] rounded-full relative overflow-hidden transition-transform duration-[5000ms] cubic-bezier(0.15, 0, 0.1, 1) shadow-[0_0_60px_rgba(0,0,0,0.3)] z-10"
              style={{ 
                transform: `rotate(${rotation}deg)`,
                backgroundImage: "url('/images/lucky-wheel.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '4px md:border-6 solid rgba(255,255,255,0.1)'
              }}
            >
            </div>
            
            {/* Center Decorative Hub */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none scale-75 md:scale-100">
              <div className="w-20 h-20 md:w-28 md:h-28 bg-gradient-to-tr from-gold via-yellow-100 to-gold rounded-full border-4 md:border-8 border-white/30 flex items-center justify-center text-center p-2 md:p-3 shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
                <div className="w-full h-full rounded-full border border-gold/40 flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm">
                   <span className="text-charcoal text-[8px] md:text-[10px] font-black uppercase leading-tight tracking-[0.2em]">ARHAM</span>
                   <div className="h-[1px] w-6 md:w-10 bg-charcoal/30 my-0.5 md:my-1"></div>
                   <span className="text-charcoal text-[6px] md:text-[8px] font-bold uppercase tracking-widest opacity-80">LUCKY SPIN</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Logic Area */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          {showResult ? (
            <div className="text-center space-y-6 animate-fade-in relative">
              {/* Confetti Elements */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute w-2 h-2 rounded-sm animate-confetti"
                    style={{
                      left: `${Math.random() * 100}%`,
                      backgroundColor: i % 2 === 0 ? '#40C0CB' : '#D4AF37',
                      animationDelay: `${Math.random() * 2}s`,
                      top: '-10px'
                    }}
                  />
                ))}
              </div>

              <div className="w-24 h-24 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto ring-8 ring-gold/5 relative">
                <Gift size={40} className="animate-bounce" />
                <div className="absolute -top-2 -right-2 bg-charcoal text-white text-[8px] font-bold px-2 py-1 rounded-full border border-gold/30">LUCKY</div>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-4xl font-heading font-bold text-charcoal bg-clip-text text-transparent bg-gradient-to-r from-charcoal via-gold to-charcoal">YOU WON!</h3>
                <p className="text-gray-400 text-sm tracking-widest uppercase font-bold">Exclusive Reward</p>
              </div>

              <div className="py-6 px-8 bg-gradient-to-br from-[#E0F7F9] to-white rounded-[2rem] border border-[#40C0CB]/20 shadow-inner group transition-all hover:scale-105">
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-black text-[#0D4449] uppercase tracking-tighter drop-shadow-sm">{winningSegment.label}</span>
                  <span className="text-[12px] text-[#40C0CB] font-black tracking-[0.3em] uppercase mt-1">{winningSegment.sub}</span>
                </div>
              </div>
              
              {winningSegment.type === 'cash' ? (
                <div className="bg-green-50 text-green-700 p-4 rounded-2xl flex items-center justify-center gap-3 border border-green-100 animate-pulse">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </div>
                  <span className="font-bold text-sm">Credited to your wallet!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                   <p className="text-xs text-gray-500 bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">Our VIP team will contact you within 24h to arrange delivery.</p>
                </div>
              )}
              
              <button 
                onClick={() => setIsOpen(false)}
                className="w-full bg-charcoal text-white py-5 rounded-full font-bold uppercase tracking-[0.2em] hover:bg-gold transition-all shadow-xl text-xs active:scale-95 flex items-center justify-center gap-3"
              >
                <span>Continue Shopping</span>
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">→</div>
              </button>
            </div>
          ) : !isLoggedIn ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-heading font-bold text-charcoal">PLAY & WIN</h3>
                <p className="text-gray-400 text-sm">Sign up now to unlock your free spin.</p>
              </div>
              
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Enter Full Name" 
                  required
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#40C0CB] outline-none transition-all placeholder:text-gray-300"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <input 
                  type="email" 
                  placeholder="Email" 
                  required
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#40C0CB] outline-none transition-all placeholder:text-gray-300"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <div className="flex gap-2">
                  <div className="w-24 px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-2">
                    <img src="https://flagcdn.com/in.svg" className="w-5" alt="IN" />
                    <span className="text-sm font-bold text-charcoal">+91</span>
                  </div>
                  <input 
                    type="tel" 
                    placeholder="Phone" 
                    required
                    className="flex-1 px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#40C0CB] outline-none transition-all placeholder:text-gray-300"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-[#40C0CB] focus:ring-[#40C0CB]" 
                    required
                    checked={formData.agreed}
                    onChange={(e) => setFormData({...formData, agreed: e.target.checked})}
                  />
                  <span className="text-[10px] text-gray-400 leading-normal group-hover:text-gray-600">
                    I agree to the Terms & Privacy Policy and consent to receiving updates.
                  </span>
                </label>

                <button 
                  type="submit"
                  className="w-full bg-[#40C0CB] text-white py-4 rounded-full font-bold uppercase tracking-[0.2em] hover:bg-[#35a8b2] transition shadow-lg text-sm"
                >
                  SEND OTP
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-8">
              <div className="space-y-2">
                <div className="w-16 h-16 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-2">
                  <Gift size={32} />
                </div>
                <h3 className="text-3xl font-heading font-bold text-charcoal">Welcome, {user?.name.split(' ')[0]}!</h3>
                <p className="text-gray-400 text-sm">Your lucky moment is here. <br/> Spin now to claim your reward!</p>
              </div>
              
              <button 
                onClick={spinWheel}
                disabled={isSpinning}
                className={`w-full py-6 rounded-full font-bold uppercase tracking-[0.2em] transition-all shadow-2xl text-lg ${
                  isSpinning 
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                    : 'bg-gold text-white hover:bg-charcoal hover:scale-105 active:scale-95 shadow-gold/20'
                }`}
              >
                {isSpinning ? 'SPINNING...' : 'SPIN NOW!'}
              </button>
              
              <div className="flex items-center justify-center gap-4 text-[9px] text-gray-300 uppercase tracking-widest font-bold">
                <div className="h-px flex-1 bg-gray-100"></div>
                <span>One Spin Per User</span>
                <div className="h-px flex-1 bg-gray-100"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LuckyWheel;
