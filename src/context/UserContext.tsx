import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Notification } from '../types';


interface UserContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (name: string, email: string, phone: string, referralCode?: string) => void;
  logout: () => void;
  addWinnings: (amount: number) => void;
  canSpin: () => boolean;
  recordSpin: (amount: number) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'isRead'>) => void;
  markNotificationsRead: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const generateReferralCode = (name: string) => {
    const safeName = name || 'User';
    return (safeName.substring(0, 3).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase());
  };

  // Data version — bump this to force-clear stale localStorage on next load
  const DATA_VERSION = 'v2';

  useEffect(() => {
    // Check version — clear old data if stale
    const storedVersion = localStorage.getItem('arham_data_version');
    if (storedVersion !== DATA_VERSION) {
      localStorage.removeItem('arham_user');
      localStorage.setItem('arham_data_version', DATA_VERSION);
    }

    const savedUser = localStorage.getItem('arham_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === 'object' && parsed.id && parsed.name && parsed.phone) {
          // Sanitize all fields with safe defaults
          const safeUser: User = {
            ...parsed,
            name: parsed.name || 'Guest',
            email: parsed.email || '',
            phone: parsed.phone || '',
            walletBalance: typeof parsed.walletBalance === 'number' ? parsed.walletBalance : 0,
            points: typeof parsed.points === 'number' ? parsed.points : 0,
            tier: parsed.tier || 'silver',
            referralCode: parsed.referralCode || generateReferralCode(parsed.name || 'User'),
            referralCount: typeof parsed.referralCount === 'number' ? parsed.referralCount : 0,
            joinedDate: parsed.joinedDate || new Date().toISOString(),
            // Sanitize notifications — ensure each has a valid 'type' field
            notifications: Array.isArray(parsed.notifications)
              ? parsed.notifications.map((n: any) => ({
                  id: n.id || Date.now().toString(),
                  title: n.title || 'Notification',
                  message: n.message || '',
                  type: n.type || 'system',
                  date: n.date || new Date().toISOString(),
                  isRead: typeof n.isRead === 'boolean' ? n.isRead : false,
                }))
              : [],
          };
          setUser(safeUser);
          // Write back the sanitized version
          localStorage.setItem('arham_user', JSON.stringify(safeUser));
        } else {
          localStorage.removeItem('arham_user');
        }
      } catch (e) {
        console.error('Safe parse failed', e);
        localStorage.removeItem('arham_user');
      }
    }
  }, []);

  const login = (name: string, email: string, phone: string, referralCode?: string) => {
    const hasReferral = !!(referralCode && referralCode.trim());
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      walletBalance: hasReferral ? 100 : 0,
      tier: 'silver',
      points: 450,
      joinedDate: new Date().toISOString(),
      referralCode: generateReferralCode(name),
      referredBy: hasReferral ? referralCode : undefined,
      referralCount: 0,
      notifications: [
        {
          id: Date.now().toString(),
          title: 'Welcome to Arham Ornaments! 🎉',
          message: hasReferral
            ? `You joined with a referral code. ₹100 has been added to your wallet as a welcome bonus!`
            : `Welcome! Explore exclusive rewards, spin the wheel daily, and refer friends to earn more.`,
          type: 'system',
          date: new Date().toISOString(),
          isRead: false,
        }
      ]
    };
    setUser(newUser);
    localStorage.setItem('arham_user', JSON.stringify(newUser));
    // Also persist to global customers list for admin view
    try {
      const all = JSON.parse(localStorage.getItem('arham_all_users') || '[]');
      const exists = all.find((u: any) => u.id === newUser.id);
      if (!exists) localStorage.setItem('arham_all_users', JSON.stringify([...all, newUser]));
    } catch {}
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('arham_user');
  };

  const addWinnings = (amount: number) => {
    setUser(prev => {
      if (!prev) return null;
      const updatedUser = { ...prev, walletBalance: prev.walletBalance + amount };
      localStorage.setItem('arham_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const canSpin = () => {
    if (!user) return false;
    if (!user.lastSpinDate) return true;
    
    const lastSpin = new Date(user.lastSpinDate);
    const today = new Date();
    return lastSpin.toDateString() !== today.toDateString();
  };

  const recordSpin = (amount: number) => {
    setUser(prev => {
      if (!prev) return null;
      const updatedUser: User = { 
        ...prev, 
        walletBalance: prev.walletBalance + amount,
        lastSpinDate: new Date().toISOString(),
        notifications: [
          {
            id: Date.now().toString(),
            title: 'Lucky Spin Reward',
            message: `You won ₹${amount} from your daily spin!`,
            type: 'offer',
            date: new Date().toISOString(),
            isRead: false
          },
          ...(prev.notifications || [])
        ]
      };
      localStorage.setItem('arham_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const addNotification = (notif: Omit<Notification, 'id' | 'date' | 'isRead'>) => {
    setUser(prev => {
      if (!prev) return null;
      const newNotif: Notification = {
        ...notif,
        id: Date.now().toString(),
        date: new Date().toISOString(),
        isRead: false
      };
      const updatedUser = { ...prev, notifications: [newNotif, ...(prev.notifications || [])] };
      localStorage.setItem('arham_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const markNotificationsRead = () => {
    setUser(prev => {
      if (!prev) return null;
      const updatedUser = { 
        ...prev, 
        notifications: (prev.notifications || []).map(n => ({ ...n, isRead: true })) 
      };
      localStorage.setItem('arham_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      isLoggedIn: !!user, 
      login, 
      logout, 
      addWinnings,
      canSpin,
      recordSpin,
      addNotification,
      markNotificationsRead
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
