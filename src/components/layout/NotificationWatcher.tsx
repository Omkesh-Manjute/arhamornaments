import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationWatcher: React.FC = () => {
  const { user, isLoggedIn } = useUser();
  const [activeToast, setActiveToast] = useState<any>(null);
  const [lastNotifCount, setLastNotifCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn || !user?.notifications) return;

    const currentCount = user.notifications.length;
    if (currentCount === 0) return;

    // Get unread notifications
    const unread = user.notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;

    // Get the most recent unread one
    const latest = unread[unread.length - 1];
    
    // Check if we've already shown a toast for this specific notification ID in this session
    const seenNotifs = JSON.parse(sessionStorage.getItem('seen_notifications') || '[]');
    
    if (!seenNotifs.includes(latest.id)) {
      setActiveToast(latest);
      
      // Mark as seen in this session
      sessionStorage.setItem('seen_notifications', JSON.stringify([...seenNotifs, latest.id]));
      
      const timer = setTimeout(() => setActiveToast(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [user?.notifications, isLoggedIn]);

  return (
    <AnimatePresence>
      {activeToast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[200] max-w-sm w-full"
        >
          <div className="bg-white/90 backdrop-blur-xl border border-gold/20 shadow-[0_20px_50px_rgba(184,134,92,0.15)] rounded-[2rem] p-5 flex gap-4 items-start relative overflow-hidden group">
            {/* Premium background glow */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-gold/10 rounded-full blur-2xl group-hover:bg-gold/20 transition-colors" />
            
            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shrink-0">
              {activeToast.type === 'offer' ? <Sparkles size={24} /> : <Bell size={24} />}
            </div>
            
            <div className="flex-1 space-y-1 pr-6">
              <h4 className="text-sm font-black text-charcoal uppercase tracking-tight">{activeToast.title}</h4>
              <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-3">{activeToast.message}</p>
              <button 
                onClick={() => {
                  navigate('/profile#notifications');
                  setActiveToast(null);
                }}
                className="text-[10px] font-black text-gold uppercase tracking-[0.2em] pt-1 hover:underline"
              >
                View Details →
              </button>
            </div>

            <button 
              onClick={() => setActiveToast(null)}
              className="absolute top-4 right-4 text-gray-300 hover:text-charcoal transition-colors p-1"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationWatcher;
