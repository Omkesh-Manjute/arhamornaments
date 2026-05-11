import React, { useState, useEffect } from 'react';
import { X, Gift, Check, Sparkles, Phone, Lock, ArrowRight, Loader2, Tag, Info, ShoppingBag, Calendar } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { auth, db } from '../lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface LuckyWheelProps {
  isEmbedded?: boolean;
}

const LuckyWheel: React.FC<LuckyWheelProps> = ({ isEmbedded = false }) => {
  const [isOpen, setIsOpen] = useState(isEmbedded);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [winningSegment, setWinningSegment] = useState<any>(null);

  // Auth States
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', referralCode: '', agreed: false });
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shouldAutoSpin, setShouldAutoSpin] = useState(false);

  const { isLoggedIn, login, recordSpin, canSpin, user } = useUser();

  useEffect(() => {
    if (isEmbedded) { setIsOpen(true); }

    // Check for referral code in URL (handle both standard and hash router)
    const getRefFromUrl = () => {
      const searchParams = new URLSearchParams(window.location.search);
      let ref = searchParams.get('ref');
      
      // Handle HashRouter params if not found in main search
      if (!ref && window.location.hash.includes('?')) {
        const hashSearch = window.location.hash.split('?')[1];
        const hashParams = new URLSearchParams(hashSearch);
        ref = hashParams.get('ref');
      }
      return ref;
    };

    const refCode = getRefFromUrl();
    if (refCode) {
      const formattedCode = refCode.toUpperCase();
      localStorage.setItem('pending_referral', formattedCode);
      setFormData(prev => ({ ...prev, referralCode: formattedCode }));
    } else {
      // Check localStorage if not in URL
      const savedRef = localStorage.getItem('pending_referral');
      if (savedRef) {
        setFormData(prev => ({ ...prev, referralCode: savedRef }));
      }
    }

    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-lucky-wheel', handleOpen);

    // Auto-open if referral code exists and not logged in
    const refCode = getRefFromUrl();
    const savedRef = localStorage.getItem('pending_referral');
    if (!isLoggedIn && (refCode || savedRef)) {
      setIsOpen(true);
    }

    return () => window.removeEventListener('open-lucky-wheel', handleOpen);
  }, [isEmbedded, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && shouldAutoSpin && canSpin() && !isSpinning) {
      setShouldAutoSpin(false);
      // Small delay to ensure the UI transition is visible
      setTimeout(() => spinWheel(), 500);
    }
  }, [isLoggedIn, shouldAutoSpin, canSpin, isSpinning]);


  const setupRecaptcha = () => {
    // Clear stale verifier on re-init
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (_) { }
      (window as any).recaptchaVerifier = null;
    }

    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': () => { }
    });
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      setupRecaptcha();
      const phoneNumber = `+91${formData.phone}`;
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setShowOtpInput(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!confirmationResult) {
        setError('Session expired. Please go back and resend OTP.');
        return;
      }

      // Step 1: Confirm OTP — result.user is the Firebase user
      const result = await confirmationResult.confirm(otp);
      const firebaseUser = result.user;

      if (!firebaseUser) {
        setError('Verification failed. Please try again.');
        return;
      }

      // Step 2: Wait for auth state to fully propagate (race condition fix)
      await new Promise<void>((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            unsubscribe();
            resolve();
          }
        });
        // Fallback timeout — 3 seconds max wait
        setTimeout(() => { unsubscribe(); resolve(); }, 3000);
      });

      // Step 3: Now call login safely
      try {
        await login(
          formData.name,
          formData.email,
          formData.phone,
          '',
          formData.referralCode
        );
        
        setShouldAutoSpin(true);


      } catch (loginErr: any) {
        console.error('Login save error:', loginErr);
        // Show actual error for debugging
        setError(
          loginErr?.message
            ? `Account setup failed: ${loginErr.message}`
            : 'Account setup failed. Please try again.'
        );
      }

    } catch (err: any) {
      console.error('OTP Error:', err);
      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid OTP. Please check the code and try again.');
      } else if (err.code === 'auth/code-expired') {
        setError('OTP expired. Please go back and request a new one.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const [segments, setSegments] = useState([
    { label: '₹250', sub: 'Cash', value: 250, type: 'cash', weight: 'Medium' },
    { label: '₹300', sub: 'Cash', value: 300, type: 'cash', weight: 'Medium' },
    { label: '₹350', sub: 'Cash', value: 350, type: 'cash', weight: 'Medium' },
    { label: '₹400', sub: 'Cash', value: 400, type: 'cash', weight: 'Medium' },
    { label: '₹450', sub: 'Cash', value: 450, type: 'cash', weight: 'Medium' },
    { label: '₹100', sub: 'Cash', value: 100, type: 'cash', weight: 'High Risk' },
    { label: '₹150', sub: 'Cash', value: 150, type: 'cash', weight: 'Medium' },
    { label: '₹200', sub: 'Cash', value: 200, type: 'cash', weight: 'Medium' },
  ]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'promotions'));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.spinSegments && data.spinSegments.length > 0) {
            setSegments(data.spinSegments.map((s: any) => ({
              ...s,
              sub: s.type === 'cash' ? 'Cash' : 'Reward'
            })));
          }
        }
      } catch (err) {
        console.error("Error fetching spin settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const getWeightValue = (weight: string) => {
    switch (weight) {
      case 'High Risk': return 50;
      case 'Medium': return 25;
      case 'Very Low': return 5;
      case 'Extremely Low': return 1;
      default: return 10;
    }
  };

  const spinWheel = async () => {
    if (isSpinning || !canSpin()) return;

    // 1. Pick a winner first based on weights
    const totalWeight = segments.reduce((acc, s) => acc + getWeightValue(s.weight || 'Medium'), 0);
    let random = Math.random() * totalWeight;
    let winningIndex = 0;

    for (let i = 0; i < segments.length; i++) {
      random -= getWeightValue(segments[i].weight || 'Medium');
      if (random <= 0) {
        winningIndex = i;
        break;
      }
    }

    const winner = segments[winningIndex];
    setIsSpinning(true);

    const segmentSize = 360 / segments.length;
    // The visual wheel has ₹250 (Index 0) at the very top (0 degrees).
    // To land on winningIndex, we need to rotate it back so that index center is at 0.
    const targetBaseRotation = (360 - (winningIndex * segmentSize)) % 360;

    // Add multiple full spins (5-8 spins) for effect
    const fullSpins = 5 + Math.floor(Math.random() * 3);
    const extraDegrees = (fullSpins * 360) + targetBaseRotation;

    // Current rotation might not be 0, so we add to it
    // But we need the FINAL rotation to result in the targetBaseRotation
    const currentModulo = rotation % 360;
    const degreesToAdd = extraDegrees - currentModulo + (extraDegrees < currentModulo ? 360 : 0);
    const newRotation = rotation + degreesToAdd;

    setRotation(newRotation);

    setTimeout(async () => {
      setIsSpinning(false);
      setWinningSegment(winner);
      setShowResult(true);
      if (winner.type === 'cash') await recordSpin(winner.value);
    }, 5000);
  };

  if (!isOpen) return null;

  const wheelPanel = (
    <div className="flex-1 bg-gradient-to-br from-[#E0F7F9] to-[#F1FCFD] p-4 sm:p-6 md:p-12 flex flex-col items-center justify-center space-y-6 md:space-y-8 min-h-[400px] md:min-h-[450px] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#40C0CB] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gold rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div id="recaptcha-container"></div>

      <div className="text-center space-y-1 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/50 backdrop-blur-md rounded-full border border-white/50 shadow-sm mb-1">
          <Sparkles size={10} className="text-gold" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0D4449]">Exclusive Rewards</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-[#0D4449] leading-tight">ARHAM <span className="text-gold">LUCKY</span> WHEEL</h2>
        <p className="text-[#5A8D92] text-[11px] sm:text-sm max-w-[240px] sm:max-w-xs mx-auto">Premium jewelry &amp; cash rewards await you. Spin the wheel of fortune!</p>
      </div>

      <div className="relative w-[260px] h-[260px] sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center z-10 shrink-0">
        {/* Outer Ring with Premium Glow */}
        <div className="absolute inset-0 rounded-full border-[10px] sm:border-[15px] border-charcoal shadow-[0_0_40px_rgba(0,0,0,0.3)] bg-charcoal/5" />

        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1.5 sm:w-2.5 h-1.5 sm:h-2.5 rounded-full z-20 ${isSpinning ? 'animate-pulse' : ''}`}
            style={{
              top: `${50 - 47 * Math.cos((i * 360 / 24) * Math.PI / 180)}%`,
              left: `${50 + 47 * Math.sin((i * 360 / 24) * Math.PI / 180)}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: isSpinning ? (i % 2 === 0 ? '#fff' : '#c5a059') : '#c5a059',
              boxShadow: isSpinning ? '0 0-8px #fff' : '0 0 4px rgba(0,0,0,0.2)',
            }}
          />
        ))}

        {/* Dynamic Indicator */}
        <div className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 z-40">
          <div className="relative">
            <div className="w-0 h-0 border-l-[10px] sm:border-l-[15px] border-r-[10px] sm:border-r-[15px] border-t-[20px] sm:border-t-[30px] border-l-transparent border-r-transparent border-t-gold drop-shadow-[0_4px_10px_rgba(197,160,89,0.5)]" />
            <div className="absolute top-[-3px] sm:top-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full shadow-inner animate-ping" />
          </div>
        </div>

        {/* The Spinning Wheel */}
        <div
          className="w-[88%] h-[88%] rounded-full z-10 shadow-2xl relative overflow-hidden border-[6px] border-gold/40 bg-white"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 5s cubic-bezier(0.15, 0, 0.1, 1)' : 'none',
            backgroundImage: 'url(/images/wheel-bg.png)',
            backgroundSize: '110% auto',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat'
          }}
        >
        </div>

        {/* Center Hub (Static - Outside rotating div) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-28 sm:h-28 bg-white rounded-full border-[8px] border-gold z-30 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.3)] overflow-hidden">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: 'url(/images/wheel-bg.png)',
              backgroundSize: '300% auto',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat'
            }}
          />
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
              <h3 className="text-4xl font-heading font-bold text-charcoal uppercase tracking-tighter">CONGRATULATIONS!</h3>
              <p className="text-gray-400 text-sm uppercase tracking-widest font-bold mt-1">You won an exclusive reward</p>
            </div>
            <div className="py-8 px-10 bg-gradient-to-br from-[#E0F7F9] to-white rounded-[2.5rem] border border-[#40C0CB]/20 shadow-2xl shadow-[#40C0CB]/10">
              <p className="text-6xl font-black text-[#0D4449]">₹{winningSegment.value}</p>
              <p className="text-xs text-[#40C0CB] font-black tracking-[0.3em] uppercase mt-2">Cash Prize</p>
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
      if (showOtpInput) {
        return (
          <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-heading font-bold text-charcoal flex items-center gap-2">
                  <Lock size={24} className="text-[#40C0CB]" />
                  Verify OTP
                </h3>
                <p className="text-gray-400 text-sm">Enter the 6-digit code sent to <span className="font-bold text-charcoal">+91 {formData.phone}</span></p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="0 0 0 0 0 0"
                  required
                  className="w-full text-center text-3xl tracking-[0.5em] font-black px-5 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#40C0CB] outline-none transition-all"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                />

                {error && (
                  <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100">
                    {error}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full bg-charcoal text-white py-4 rounded-2xl font-bold uppercase tracking-[0.2em] hover:bg-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg text-sm flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                  Verify &amp; Create Account
                </button>
                <button
                  type="button"
                  onClick={() => setShowOtpInput(false)}
                  className="text-xs text-gray-400 font-bold uppercase tracking-widest hover:text-charcoal transition-colors"
                >
                  Back to Details
                </button>
              </div>
            </form>
          </div>
        );
      }

      return (
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <h3 className="text-2xl font-heading font-bold text-charcoal">Join &amp; Win</h3>
              <p className="text-gray-400 text-sm mt-1">Sign up to unlock your free spin.</p>
            </div>
            <div className="space-y-3">
              <input
                type="text" placeholder="Full Name" required
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#40C0CB] outline-none transition-all text-sm font-bold"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="email" placeholder="Email Address" required
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#40C0CB] outline-none transition-all text-sm font-bold"
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
                  pattern="[0-9]{10}"
                  className="flex-1 px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#40C0CB] outline-none transition-all text-sm font-bold"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <input
                type="text" placeholder="Referral Code (Optional — get ₹100 bonus)"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#40C0CB] outline-none transition-all text-sm font-bold"
                value={formData.referralCode}
                onChange={e => setFormData({ ...formData, referralCode: e.target.value })}
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100">
                {error}
              </p>
            )}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox" required
                className="mt-1 w-4 h-4 rounded border-gray-300 accent-[#40C0CB]"
                checked={formData.agreed}
                onChange={e => setFormData({ ...formData, agreed: e.target.checked })}
              />
              <span className="text-[10px] text-gray-400 leading-relaxed font-medium">
                I agree to the Terms &amp; Privacy Policy and consent to receiving updates from Arham Ornaments.
              </span>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#40C0CB] text-white py-4 rounded-2xl font-bold uppercase tracking-[0.2em] hover:bg-[#0D4449] disabled:opacity-50 transition-all shadow-lg text-sm flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={16} />}
              Send OTP &amp; Continue
            </button>
          </form>
        </div>
      );
    }

    return (
      <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white/50 backdrop-blur-sm">
        <div className="text-center space-y-10 relative">
          {/* Sparkle effects */}
          <div className="absolute -top-10 left-0 right-0 flex justify-center opacity-20 pointer-events-none">
            <Sparkles className="text-gold animate-pulse" size={64} />
          </div>

          <div className="space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-gold to-amber-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-gold/20 rotate-3 group-hover:rotate-6 transition-transform">
              <Gift size={36} />
            </div>
            <h3 className="text-3xl sm:text-4xl font-heading font-bold text-charcoal tracking-tight">
              Welcome, <span className="text-gold">{user?.name?.split(' ')[0] || 'Guest'}</span>! 🎉
            </h3>
            <p className="text-gray-500 text-[13px] sm:text-sm leading-relaxed max-w-[220px] sm:max-w-[250px] mx-auto font-medium">
              {canSpin()
                ? 'Your daily lucky spin is ready. High-value jewelry rewards are waiting!'
                : 'You have already claimed your reward for today. See you tomorrow!'}
            </p>
          </div>

          <div className="space-y-4">
            <button
              id="spin-now-button"
              onClick={spinWheel}
              disabled={isSpinning || !canSpin()}
              className={`w-full py-5 sm:py-6 rounded-[2rem] font-black uppercase tracking-[0.25em] transition-all shadow-2xl text-base sm:text-lg relative overflow-hidden group ${isSpinning || !canSpin()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : 'bg-charcoal text-white hover:bg-gold hover:scale-[1.02] active:scale-95 shadow-charcoal/20'
                }`}
            >
              <span className="relative z-10">
                {isSpinning ? '✨ SPINNING...' : !canSpin() ? '⏰ TOMORROW' : '🎰 SPIN NOW!'}
              </span>
              {!isSpinning && canSpin() && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer transition-transform" />
              )}
            </button>
            <div className="flex items-center gap-4 text-[10px] text-gray-300 uppercase tracking-[0.3em] font-black">
              <div className="h-px flex-1 bg-gray-100" />
              <span>Elite Rewards</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
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

