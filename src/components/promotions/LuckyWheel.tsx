import React, { useState, useEffect, useRef } from 'react';
import { X, Gift, Check, Sparkles, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { auth, db } from '../../lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface LuckyWheelProps { isEmbedded?: boolean; }

// ── SVG Wheel ────────────────────────────────────────────────────────────────
const COLORS = ['#c5a059','#e8d5a0','#b8865c','#d4b896','#a07040','#e0c878','#c89050','#d8c090'];

interface Seg { id:number; label:string; value:number; type:string; weight:string; }

const SvgWheel: React.FC<{ segments:Seg[]; rotation:number; isSpinning:boolean }> = ({ segments, rotation, isSpinning }) => {
  const n = segments.length;
  const cx = 200, cy = 200, r = 190;
  const sliceAngle = 360 / n;

  const polarToXY = (angleDeg:number, radius:number) => {
    const rad = (angleDeg - 90) * Math.PI / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const makeArcPath = (i:number) => {
    const start = i * sliceAngle;
    const end   = start + sliceAngle;
    const s = polarToXY(start, r);
    const e = polarToXY(end,   r);
    const large = sliceAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
  };

  return (
    <svg
      viewBox="0 0 400 400"
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: isSpinning ? 'transform 5s cubic-bezier(0.15,0,0.1,1)' : 'none',
        width: '100%', height: '100%',
        filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.25))',
      }}
    >
      <defs>
        <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff8e8" />
          <stop offset="100%" stopColor="#c5a059" />
        </radialGradient>
        {segments.map((_, i) => (
          <radialGradient key={i} id={`sg${i}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLORS[i % COLORS.length]} stopOpacity="0.95" />
            <stop offset="100%" stopColor={COLORS[i % COLORS.length]} stopOpacity="0.75" />
          </radialGradient>
        ))}
      </defs>

      {/* Outer rim */}
      <circle cx={cx} cy={cy} r={r+6} fill="#1a1a1a" />
      <circle cx={cx} cy={cy} r={r+2} fill="none" stroke="#c5a059" strokeWidth="3" />

      {/* Segments */}
      {segments.map((seg, i) => {
        const midAngle = i * sliceAngle + sliceAngle / 2;
        const txtR = r * 0.62;
        const tx = polarToXY(midAngle, txtR);
        return (
          <g key={i}>
            <path
              d={makeArcPath(i)}
              fill={`url(#sg${i})`}
              stroke="#fff"
              strokeWidth="1.5"
            />
            {/* Divider lines */}
            <line
              x1={cx} y1={cy}
              x2={polarToXY(i * sliceAngle, r).x}
              y2={polarToXY(i * sliceAngle, r).y}
              stroke="#fff" strokeWidth="1.5" opacity="0.6"
            />
            {/* Label */}
            <text
              x={tx.x} y={tx.y}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${midAngle}, ${tx.x}, ${tx.y})`}
              fill="#1a1a1a"
              fontWeight="800"
              fontFamily="'Inter', sans-serif"
              style={{ fontSize: n > 8 ? '11px' : '13px' }}
            >
              <tspan x={tx.x} dy="-7">₹{seg.value}</tspan>
              <tspan x={tx.x} dy="16" fontSize="9" opacity="0.75">Cash</tspan>
            </text>
          </g>
        );
      })}

      {/* Inner decorative ring */}
      <circle cx={cx} cy={cy} r={r * 0.28} fill="none" stroke="#fff" strokeWidth="2" opacity="0.4" />
      <circle cx={cx} cy={cy} r={r * 0.3} fill="url(#hubGrad)" />
      <text x={cx} y={cy-6} textAnchor="middle" dominantBaseline="middle" fontWeight="900" fontFamily="'Inter',sans-serif" fontSize="11" fill="#1a1a1a">PLAY</text>
      <text x={cx} y={cy+8} textAnchor="middle" dominantBaseline="middle" fontWeight="900" fontFamily="'Inter',sans-serif" fontSize="11" fill="#1a1a1a">& WIN</text>
    </svg>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const LuckyWheel: React.FC<LuckyWheelProps> = ({ isEmbedded = false }) => {
  const [isOpen, setIsOpen] = useState(isEmbedded);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [winningSegment, setWinningSegment] = useState<any>(null);

  const [formData, setFormData] = useState({ name:'', email:'', phone:'', referralCode:'', agreed:false });
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shouldAutoSpin, setShouldAutoSpin] = useState(false);

  const { isLoggedIn, login, recordSpin, canSpin, user } = useUser();

  const [segments, setSegments] = useState<Seg[]>([
    { id:1, label:'₹100 Cash', value:100, type:'cash', weight:'High' },
    { id:2, label:'₹150 Cash', value:150, type:'cash', weight:'Medium' },
    { id:3, label:'₹200 Cash', value:200, type:'cash', weight:'Medium' },
    { id:4, label:'₹250 Cash', value:250, type:'cash', weight:'Medium' },
    { id:5, label:'₹300 Cash', value:300, type:'cash', weight:'Medium' },
    { id:6, label:'₹350 Cash', value:350, type:'cash', weight:'Medium' },
    { id:7, label:'₹400 Cash', value:400, type:'cash', weight:'Medium' },
    { id:8, label:'₹450 Cash', value:450, type:'cash', weight:'Low' },
  ]);

  useEffect(() => {
    if (isEmbedded) setIsOpen(true);
    const getRef = () => {
      const sp = new URLSearchParams(window.location.search);
      let ref = sp.get('ref');
      if (!ref && window.location.hash.includes('?')) {
        ref = new URLSearchParams(window.location.hash.split('?')[1]).get('ref');
      }
      return ref;
    };
    const refCode = getRef();
    if (refCode) {
      const fc = refCode.toUpperCase();
      localStorage.setItem('pending_referral', fc);
      setFormData(p => ({ ...p, referralCode: fc }));
    } else {
      const saved = localStorage.getItem('pending_referral');
      if (saved) setFormData(p => ({ ...p, referralCode: saved }));
    }
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-lucky-wheel', handleOpen);
    if (!isLoggedIn && (refCode || localStorage.getItem('pending_referral'))) setIsOpen(true);
    return () => window.removeEventListener('open-lucky-wheel', handleOpen);
  }, [isEmbedded, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && shouldAutoSpin && canSpin() && !isSpinning) {
      setShouldAutoSpin(false);
      setTimeout(() => spinWheel(), 500);
    }
  }, [isLoggedIn, shouldAutoSpin, canSpin, isSpinning]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'promotions'));
        if (snap.exists()) {
          const d = snap.data();
          if (d.spinSegments?.length > 0) setSegments(d.spinSegments);
        }
      } catch(e) { console.error(e); }
    };
    fetch();
  }, []);

  const getWeight = (w:string) => ({ 'Very High':100,'High':50,'Medium':25,'Low':10,'Very Low':5,'Extremely Low':1 }[w] ?? 25);

  const setupRecaptcha = () => {
    if ((window as any).recaptchaVerifier) {
      try { (window as any).recaptchaVerifier.clear(); } catch(_) {}
      (window as any).recaptchaVerifier = null;
    }
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size:'invisible', callback:()=>{} });
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      setupRecaptcha();
      const conf = await signInWithPhoneNumber(auth, `+91${formData.phone}`, (window as any).recaptchaVerifier);
      setConfirmationResult(conf); setShowOtpInput(true);
    } catch(err:any) { setError(err.message || 'Failed to send OTP.'); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (!confirmationResult) { setError('Session expired.'); return; }
      const result = await confirmationResult.confirm(otp);
      if (!result.user) { setError('Verification failed.'); return; }
      await new Promise<void>(res => {
        const unsub = auth.onAuthStateChanged(u => { if(u){unsub();res();} });
        setTimeout(() => { unsub(); res(); }, 3000);
      });
      try {
        await login(formData.name, formData.email, formData.phone, '', formData.referralCode);
        setShouldAutoSpin(true);
      } catch(le:any) { setError(le?.message ? `Account setup failed: ${le.message}` : 'Account setup failed.'); }
    } catch(err:any) {
      if (err.code==='auth/invalid-verification-code') setError('Invalid OTP.');
      else if(err.code==='auth/code-expired') setError('OTP expired.');
      else setError(err.message || 'Something went wrong.');
    } finally { setLoading(false); }
  };

  const spinWheel = async () => {
    if (isSpinning || !canSpin()) return;
    const totalW = segments.reduce((a,s) => a + getWeight(s.weight||'Medium'), 0);
    let rnd = Math.random() * totalW;
    let winIdx = 0;
    for (let i=0; i<segments.length; i++) {
      rnd -= getWeight(segments[i].weight||'Medium');
      if (rnd <= 0) { winIdx = i; break; }
    }
    const winner = segments[winIdx];
    setIsSpinning(true);

    // Pointer is at top (0°). Segment i occupies [i*slice, (i+1)*slice].
    // To center segment i under pointer: rotate so that the mid-angle of segment i = 0°
    // mid = winIdx * slice + slice/2  →  we need to rotate by -(mid) mod 360 = 360 - mid
    const slice = 360 / segments.length;
    const mid = winIdx * slice + slice / 2;
    const targetBase = (360 - mid + 360) % 360;

    const curMod = ((rotation % 360) + 360) % 360;
    const delta  = (targetBase - curMod + 360) % 360;
    const fullSpins = (5 + Math.floor(Math.random() * 3)) * 360;
    const newRotation = rotation + fullSpins + delta;

    setRotation(newRotation);
    setTimeout(async () => {
      setIsSpinning(false);
      setWinningSegment(winner);
      setShowResult(true);
      if (winner.value > 0) await recordSpin(winner.value);
    }, 5000);
  };

  if (!isOpen) return null;

  const WheelPanel = (
    <div className="flex-1 bg-gradient-to-br from-[#FAF6EE] to-[#FFFBF2] p-4 sm:p-6 md:p-10 flex flex-col items-center justify-center space-y-4 md:space-y-6 min-h-[400px] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#c5a059] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-amber-500 rounded-full blur-3xl animate-pulse delay-700" />
      </div>
      <div id="recaptcha-container" />
      <div className="text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/50 backdrop-blur-md rounded-full border border-[#c5a059]/20 shadow-sm mb-2">
          <Sparkles size={10} className="text-[#c5a059]" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-charcoal">Exclusive Rewards</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-charcoal leading-tight">ARHAM <span className="text-[#c5a059]">LUCKY</span> WHEEL</h2>
        <p className="text-gray-400 text-xs sm:text-sm max-w-xs mx-auto mt-1">Spin the wheel of fortune!</p>
      </div>

      {/* Wheel container */}
      <div className="relative w-[260px] h-[260px] sm:w-72 sm:h-72 md:w-80 md:h-80 z-10 shrink-0">
        {/* Gold dots ring */}
        {[...Array(24)].map((_,i) => (
          <div key={i} className={`absolute w-2 h-2 rounded-full z-20 ${isSpinning?'animate-pulse':''}`}
            style={{
              top:`${50-47*Math.cos((i*15)*Math.PI/180)}%`,
              left:`${50+47*Math.sin((i*15)*Math.PI/180)}%`,
              transform:'translate(-50%,-50%)',
              backgroundColor: isSpinning?(i%2===0?'#fff':'#c5a059'):'#c5a059',
              boxShadow:'0 0 4px rgba(0,0,0,0.3)',
            }}
          />
        ))}

        {/* Pointer */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-40">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-[#c5a059] drop-shadow-lg" />
        </div>

        {/* SVG Wheel */}
        <div className="absolute inset-4 rounded-full overflow-hidden shadow-2xl border-4 border-[#c5a059]/40">
          <SvgWheel segments={segments} rotation={rotation} isSpinning={isSpinning} />
        </div>
      </div>
    </div>
  );

  const renderRightPanel = () => {
    if (showResult && winningSegment) return (
      <div className="flex-1 p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-white">
        <div className="text-center space-y-5">
          <div className="w-16 h-16 bg-[#c5a059]/10 text-[#c5a059] rounded-full flex items-center justify-center mx-auto ring-8 ring-[#c5a059]/5">
            <Gift size={28} className="animate-bounce" />
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-charcoal uppercase tracking-tight">CONGRATULATIONS!</h3>
            <p className="text-gray-400 text-[10px] uppercase tracking-widest font-black mt-1">You won an exclusive reward</p>
          </div>
          <div className="py-6 px-8 bg-gradient-to-br from-[#FAF6EE] to-white rounded-[2rem] border border-[#c5a059]/20 shadow-xl">
            <p className="text-5xl font-black text-charcoal">₹{winningSegment.value}</p>
            <p className="text-[10px] text-[#c5a059] font-black tracking-[0.3em] uppercase mt-2">
              {winningSegment.value > 0 ? 'Cash Prize' : 'Reward Won'}
            </p>
          </div>
          {winningSegment.value > 0 ? (
            <div className="bg-green-50 text-green-700 p-3.5 rounded-xl flex items-center justify-center gap-2.5 border border-green-100">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shrink-0"><Check size={12} className="text-white"/></div>
              <span className="font-bold text-xs">₹{winningSegment.value} credited to your wallet!</span>
            </div>
          ) : (
            <p className="text-[11px] text-gray-500 bg-gray-50 p-3.5 rounded-xl border border-dashed border-gray-200">Our VIP team will contact you within 24h.</p>
          )}
          <button onClick={() => { if(!isEmbedded) setIsOpen(false); else setShowResult(false); }}
            className="w-full bg-charcoal text-white py-4 rounded-xl font-bold uppercase tracking-[0.2em] hover:bg-[#c5a059] transition-all shadow-lg text-xs">
            {isEmbedded ? 'Go to My Profile →' : 'Continue Shopping →'}
          </button>
        </div>
      </div>
    );

    if (!isLoggedIn) {
      if (showOtpInput) return (
        <div className="flex-1 p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-white">
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <h3 className="text-2xl font-bold text-charcoal flex items-center gap-2"><Lock size={20} className="text-[#c5a059]"/>Verify OTP</h3>
              <p className="text-gray-400 text-xs mt-1">Code sent to <span className="font-bold text-charcoal">+91 {formData.phone}</span></p>
            </div>
            <input type="text" maxLength={6} placeholder="0 0 0 0 0 0" required
              className="w-full text-center text-2xl tracking-[0.4em] font-black px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#c5a059] outline-none"
              value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,''))} />
            {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
            <div className="flex flex-col gap-3">
              <button type="submit" disabled={loading||otp.length<6}
                className="w-full bg-charcoal text-white py-3.5 rounded-xl font-bold uppercase tracking-[0.2em] hover:bg-[#c5a059] disabled:opacity-50 transition-all shadow-md text-xs flex items-center justify-center gap-2">
                {loading?<Loader2 className="animate-spin" size={16}/>:<Check size={16}/>} Verify & Create Account
              </button>
              <button type="button" onClick={() => setShowOtpInput(false)} className="text-[11px] text-gray-400 font-bold uppercase tracking-widest hover:text-charcoal transition-colors">Back to Details</button>
            </div>
          </form>
        </div>
      );

      return (
        <div className="flex-1 p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-white">
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-charcoal">Join & Win</h3>
              <p className="text-gray-400 text-xs mt-1">Sign up to unlock your free spin.</p>
            </div>
            <div className="space-y-2.5">
              <input type="text" placeholder="Full Name" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#c5a059] outline-none text-xs font-bold text-charcoal" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})}/>
              <input type="email" placeholder="Email Address" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#c5a059] outline-none text-xs font-bold text-charcoal" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})}/>
              <div className="flex gap-2">
                <div className="w-20 px-3 py-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-1.5 shrink-0">
                  <img src="https://flagcdn.com/in.svg" className="w-5" alt="IN"/>
                  <span className="text-xs font-bold text-charcoal">+91</span>
                </div>
                <input type="tel" placeholder="Phone Number" required pattern="[0-9]{10}" className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#c5a059] outline-none text-xs font-bold text-charcoal" value={formData.phone} onChange={e=>setFormData({...formData,phone:e.target.value})}/>
              </div>
              <input type="text" placeholder="Referral Code (Optional — get ₹100 bonus)" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#c5a059] outline-none text-xs font-bold text-charcoal" value={formData.referralCode} onChange={e=>setFormData({...formData,referralCode:e.target.value})}/>
            </div>
            {error && <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" required className="mt-1 w-3.5 h-3.5 rounded border-gray-300 accent-[#c5a059]" checked={formData.agreed} onChange={e=>setFormData({...formData,agreed:e.target.checked})}/>
              <span className="text-[9px] text-gray-400 leading-relaxed font-medium">I agree to the Terms & Privacy Policy and consent to receiving updates from Arham Ornaments.</span>
            </label>
            <button type="submit" disabled={loading} className="w-full bg-[#c5a059] text-white py-3.5 rounded-xl font-bold uppercase tracking-[0.2em] hover:bg-[#a88241] disabled:opacity-50 transition-all shadow-md text-xs flex items-center justify-center gap-2">
              {loading?<Loader2 className="animate-spin" size={16}/>:<Sparkles size={14}/>} Send OTP & Continue
            </button>
          </form>
        </div>
      );
    }

    return (
      <div className="flex-1 p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-white/50 backdrop-blur-sm">
        <div className="text-center space-y-8 relative">
          <div className="space-y-3">
            <div className="w-16 h-16 bg-gradient-to-br from-[#c5a059] to-amber-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-[#c5a059]/20 rotate-3">
              <Gift size={28}/>
            </div>
            <h3 className="text-2xl font-bold text-charcoal tracking-tight">Welcome, <span className="text-[#c5a059]">{user?.name?.split(' ')[0]||'Guest'}</span>! 🎉</h3>
            <p className="text-gray-500 text-xs leading-relaxed max-w-[240px] mx-auto font-medium">
              {canSpin() ? 'Unlock your exclusive welcome gift! Spin now to win cash rewards for your first purchase.' : 'You have already claimed your unique welcome reward! Explore our collections to use your winnings.'}
            </p>
          </div>
          <button id="spin-now-button" onClick={spinWheel} disabled={isSpinning||!canSpin()}
            className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.25em] transition-all shadow-xl text-base relative overflow-hidden ${isSpinning||!canSpin()?'bg-gray-100 text-gray-400 cursor-not-allowed':'bg-charcoal text-white hover:bg-[#c5a059] hover:scale-[1.02] active:scale-95'}`}>
            {isSpinning ? '✨ SPINNING...' : !canSpin() ? 'CLAIMED' : '🎰 SPIN NOW!'}
          </button>
        </div>
      </div>
    );
  };

  const modal = (
    <div className={`bg-white rounded-[2rem] overflow-hidden max-w-4xl w-full relative flex flex-col md:flex-row shadow-2xl ${isEmbedded?'':'max-h-[95vh] overflow-y-auto'}`}>
      {!isEmbedded && (
        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 z-50 p-2 bg-gray-100/80 hover:bg-gray-200 rounded-full transition shadow-lg">
          <X size={20}/>
        </button>
      )}
      {WheelPanel}
      {renderRightPanel()}
    </div>
  );

  if (isEmbedded) return modal;
  return <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">{modal}</div>;
};

export default LuckyWheel;
