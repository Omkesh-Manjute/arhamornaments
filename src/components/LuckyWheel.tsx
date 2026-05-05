import React, { useState, useEffect } from 'react';
import { X, Gift, Check, Sparkles } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface LuckyWheelProps {
  isEmbedded?: boolean;
}

const LuckyWheel: React.FC<LuckyWheelProps> = ({ isEmbedded = false }) => {
  const [isOpen, setIsOpen] = useState(isEmbedded);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [winningSegment, setWinningSegment] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', referralCode: '', agreed: false });

  const { isLoggedIn, login, recordSpin, canSpin, user } = useUser();

  useEffect(() => {
    if (isEmbedded) { setIsOpen(true); return; }
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-lucky-wheel', handleOpen);
    return () => window.removeEventListener('open-lucky-wheel', handleOpen);
  }, [isEmbedded]);

  const segments = [
    { label: '₹500', sub: 'Wallet Cash', value: 500, type: 'cash' },
    { label: '2 Gram', sub: 'Gold Coin', value: 0, type: 'item' },
    { label: '₹250', sub: 'Wallet Cash', value: 250, type: 'cash' },
    { label: 'Diamond', sub: 'Pendant', value: 0, type: 'item' },
    { label: '₹10K', sub: 'Diamond Pendant', value: 0, type: 'item' },
    { label: 'Diamond', sub: 'Pendant', value: 0, type: 'item' },
    { label: '₹250', sub: 'Wallet Cash', value: 250, type: 'cash' },
    { label: 'Diamond', sub: 'Pendant', value: 0, type: 'item' },
  ];

  const spinWheel = () => {
    if (isSpinning || !canSpin()) return;
    setIsSpinning(true);
    const extraDegrees = 1800 + Math.floor(Math.random() * 360);
    const newRotation = rotation + extraDegrees;
    setRotation(newRotation);
    setTimeout(() => {
      setIsSpinning(false);
      const segmentSize = 360 / segments.length;
      const index = Math.floor(((360 - (newRotation % 360)) % 360) / segmentSize);
      const winner = segments[Math.min(index, segments.length - 1)];
      setWinningSegment(winner);
      setShowResult(true);
      if (winner.type === 'cash') recordSpin(winner.value);
    }, 5000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.phone && formData.agreed) {
      login(formData.name, formData.email, formData.phone, formData.referralCode);
    }
  };

  if (!isOpen) return null;

  const wheelPanel = (
    <div className="flex-1 bg-[#E0F7F9] p-6 md:p-12 flex flex-col items-center justify-center space-y-6 min-h-[350px]">
      <div className="text-center space-y-1">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#40C0CB]">Sign Up &amp; Win</span>
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#0D4449]">PLAY &amp; WIN</h2>
        <p className="text-[#5A8D92] text-xs">Assured rewards worth up to <span className="font-bold text-charcoal">₹500</span></p>
      </div>

      <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-[10px] border-[#0D4449] shadow-[0_0_50px_rgba(64,192,203,0.4)]" />
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full z-20 ${isSpinning ? 'animate-pulse' : ''}`}
            style={{
              top: `${50 - 47 * Math.cos((i * 360 / 24) * Math.PI / 180)}%`,
              left: `${50 + 47 * Math.sin((i * 360 / 24) * Math.PI / 180)}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: isSpinning ? (i % 2 === 0 ? '#fff' : '#40C0CB') : '#40C0CB',
              boxShadow: '0 0 6px rgba(255,255,255,0.8)',
            }}
          />
        ))}
        <div className={`absolute -top-5 left-1/2 -translate-x-1/2 z-30 ${isSpinning ? 'animate-bounce' : ''}`}>
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-gold drop-shadow-lg" />
        </div>
        <div
          className="w-[88%] h-[88%] rounded-full z-10 shadow-xl"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 5s cubic-bezier(0.15,0,0.1,1)' : 'none',
            backgroundImage: "url('/images/lucky-wheel.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="w-16 h-16 bg-gradient-to-br from-gold to-amber-400 rounded-full border-4 border-white flex flex-col items-center justify-center shadow-xl">
            <span className="text-white text-[7px] font-black uppercase leading-tight tracking-wider">ARHAM</span>
            <span className="text-white text-[6px] font-bold uppercase tracking-widest opacity-80">LUCKY</span>
          </div>
        </div>
      </div>
    </div>
  );

  const rightPanel = () => {
    if (showResult && winningSegment) {
      return (
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto ring-8 ring-gold/5">
              <Gift size={36} className="animate-bounce" />
            </div>
            <div>
              <h3 className="text-4xl font-heading font-bold text-charcoal">YOU WON!</h3>
              <p className="text-gray-400 text-sm uppercase tracking-widest font-bold mt-1">Exclusive Reward</p>
            </div>
            <div className="py-6 px-8 bg-gradient-to-br from-[#E0F7F9] to-white rounded-[2rem] border border-[#40C0CB]/20 shadow-inner">
              <p className="text-4xl font-black text-[#0D4449]">{winningSegment.label}</p>
              <p className="text-sm text-[#40C0CB] font-black tracking-[0.2em] uppercase mt-1">{winningSegment.sub}</p>
            </div>
            {winningSegment.type === 'cash' ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-2xl flex items-center justify-center gap-3 border border-green-100">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
                <span className="font-bold text-sm">₹{winningSegment.value} credited to your wallet!</span>
              </div>
            ) : (
              <p className="text-xs text-gray-500 bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                Our VIP team will contact you within 24h to arrange delivery.
              </p>
            )}
            <button
              onClick={() => { if (!isEmbedded) setIsOpen(false); else { setShowResult(false); } }}
              className="w-full bg-charcoal text-white py-5 rounded-full font-bold uppercase tracking-[0.2em] hover:bg-gold transition-all shadow-xl text-xs active:scale-95"
            >
              {isEmbedded ? 'Go to My Profile →' : 'Continue Shopping →'}
            </button>
          </div>
        </div>
      );
    }

    if (!isLoggedIn) {
      return (
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <h3 className="text-2xl font-heading font-bold text-charcoal">Join &amp; Win</h3>
              <p className="text-gray-400 text-sm mt-1">Sign up to unlock your free spin.</p>
            </div>
            <div className="space-y-3">
              <input
                type="text" placeholder="Full Name" required
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#40C0CB] outline-none transition-all text-sm"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="email" placeholder="Email Address" required
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#40C0CB] outline-none transition-all text-sm"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
              <div className="flex gap-2">
                <div className="w-20 px-3 py-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-1.5 shrink-0">
                  <img src="https://flagcdn.com/in.svg" className="w-5" alt="IN" />
                  <span className="text-sm font-bold text-charcoal">+91</span>
                </div>
                <input
                  type="tel" placeholder="Phone Number" required
                  className="flex-1 px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#40C0CB] outline-none transition-all text-sm"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <input
                type="text" placeholder="Referral Code (Optional — get ₹100 bonus)"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#40C0CB] outline-none transition-all text-sm"
                value={formData.referralCode}
                onChange={e => setFormData({ ...formData, referralCode: e.target.value })}
              />
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox" required
                className="mt-1 w-4 h-4 rounded border-gray-300 accent-[#40C0CB]"
                checked={formData.agreed}
                onChange={e => setFormData({ ...formData, agreed: e.target.checked })}
              />
              <span className="text-[10px] text-gray-400 leading-relaxed">
                I agree to the Terms &amp; Privacy Policy and consent to receiving updates from Arham Ornaments.
              </span>
            </label>
            <button
              type="submit"
              className="w-full bg-[#40C0CB] text-white py-4 rounded-2xl font-bold uppercase tracking-[0.2em] hover:bg-[#0D4449] transition-all shadow-lg text-sm flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              Create Account &amp; Spin
            </button>
          </form>
        </div>
      );
    }

    return (
      <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
        <div className="text-center space-y-8">
          <div>
            <div className="w-16 h-16 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-3">
              <Gift size={32} />
            </div>
            <h3 className="text-3xl font-heading font-bold text-charcoal">
              Welcome, {user?.name?.split(' ')[0] || 'Guest'}! 🎉
            </h3>
            <p className="text-gray-400 text-sm mt-2">
              {canSpin()
                ? 'Your spin is ready! Claim your reward now.'
                : 'You have already spun today. Come back tomorrow!'}
            </p>
          </div>
          <button
            onClick={spinWheel}
            disabled={isSpinning || !canSpin()}
            className={`w-full py-6 rounded-full font-bold uppercase tracking-[0.2em] transition-all shadow-2xl text-lg ${
              isSpinning || !canSpin()
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-gold text-white hover:bg-charcoal hover:scale-105 active:scale-95 shadow-gold/20'
            }`}
          >
            {isSpinning ? '✨ SPINNING...' : !canSpin() ? '⏰ Come Back Tomorrow' : '🎰 SPIN NOW!'}
          </button>
          <div className="flex items-center gap-3 text-[9px] text-gray-300 uppercase tracking-widest font-bold">
            <div className="h-px flex-1 bg-gray-100" />
            <span>Daily Spin · Assured Rewards</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>
        </div>
      </div>
    );
  };

  const modal = (
    <div className={`bg-white rounded-[2rem] overflow-hidden max-w-4xl w-full relative flex flex-col md:flex-row shadow-2xl ${isEmbedded ? '' : 'max-h-[95vh] overflow-y-auto'}`}>
      {!isEmbedded && (
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-50 p-2 bg-gray-100/80 hover:bg-gray-200 rounded-full transition shadow-lg"
        >
          <X size={20} />
        </button>
      )}
      {wheelPanel}
      {rightPanel()}
    </div>
  );

  if (isEmbedded) return modal;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {modal}
    </div>
  );
};

export default LuckyWheel;
