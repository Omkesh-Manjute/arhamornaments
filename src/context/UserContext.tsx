import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Notification } from '../types';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, arrayUnion, increment, serverTimestamp } from 'firebase/firestore';
import { referralService } from '../services/referralService';


interface UserContextType {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (name: string, email: string, phone: string, address: string, referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  addWinnings: (amount: number) => Promise<void>;
  canSpin: () => boolean;
  recordSpin: (amount: number) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'isRead'>) => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const generateReferralCode = (name: string) => {
    const safeName = name || 'User';
    return (safeName.substring(0, 3).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase());
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, fetch profile from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Listen for real-time updates to the user profile
        const unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = { id: firebaseUser.uid, ...docSnap.data() } as User;
            setUser(userData);
            
            // Check for and process any pending referral credits for this user
            referralService.processPendingReferrals(firebaseUser.uid, (amount) => {
              console.log(`Referral credit of ₹${amount} processed!`);
            });
          } else {
            // Document doesn't exist yet, but user is authenticated
            // This case is handled during the login/signup flow
            setUser(null);
          }
          setLoading(false);
        });

        return () => unsubscribeDoc();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const login = async (name: string, email: string, phone: string, address: string = '', referralCode?: string) => {
    // Wait for auth to be ready
    if (!auth.currentUser) {
      let attempts = 0;
      while (!auth.currentUser && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
    }

    const firebaseUser = auth.currentUser;
    if (!firebaseUser) throw new Error("No authenticated user found. Please try again.");

    const uid = firebaseUser.uid;
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    // Prepare referral info regardless of whether doc exists
    const hasReferral = !!(referralCode && referralCode.trim());
    let referrerUid: string | null = null;
    if (hasReferral) {
      try {
        referrerUid = await referralService.validateCode(referralCode!);
      } catch (err) {
        console.warn("Referral validation failed:", err);
      }
    }

    if (userDoc.exists()) {
      const existingData = userDoc.data();
      // If user exists but hasn't been referred yet, we can apply the referral now
      const updateData: any = {
        name,
        email,
        phone,
        address: address || existingData.address || ''
      };

      if (!existingData.referredBy && referrerUid) {
        updateData.referredBy = referrerUid;
        updateData.walletBalance = increment(100);
        updateData.notifications = arrayUnion({
          id: Date.now().toString(),
          title: 'Referral Bonus! 🎊',
          message: `You joined with a referral code. ₹100 has been added to your wallet as a welcome bonus!`,
          type: 'system',
          date: new Date().toISOString(),
          isRead: false,
        });

        // Credit the referrer
        await referralService.creditReferrer(referrerUid, name);
      }

      await updateDoc(userDocRef, updateData);
      return;
    }

    // New user setup
    const userData = {
      name,
      email,
      phone,
      address,
      walletBalance: referrerUid ? 100 : 0,
      tier: 'silver',
      points: 450,
      joinedDate: new Date().toISOString(),
      createdAt: serverTimestamp(),
      referralCode: generateReferralCode(name),
      referredBy: referrerUid || null,
      referralCount: 0,
      notifications: [
        {
          id: Date.now().toString(),
          title: 'Welcome to Arham Ornaments! 🎉',
          message: referrerUid
            ? `You joined with a referral code. ₹100 has been added to your wallet as a welcome bonus!`
            : `Welcome! Explore exclusive rewards, spin the wheel daily, and refer friends to earn more.`,
          type: 'system',
          date: new Date().toISOString(),
          isRead: false,
        }
      ]
    };

    await setDoc(userDocRef, userData, { merge: true });

    // Credit the referrer
    if (referrerUid) {
      try {
        await referralService.creditReferrer(referrerUid, name);
      } catch (err) {
        console.error("Failed to credit referrer:", err);
      }
    }

    // Clear pending referral after successful registration
    localStorage.removeItem('pending_referral');
  };


  const logout = async () => {
    await signOut(auth);
  };

  const addWinnings = async (amount: number) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.id);
    await updateDoc(userDocRef, {
      walletBalance: increment(amount)
    });
  };


  const canSpin = () => {
    if (!user) return false;
    if (!user.lastSpinDate) return true;
    
    const lastSpin = new Date(user.lastSpinDate);
    const today = new Date();
    return lastSpin.toDateString() !== today.toDateString();
  };

  const recordSpin = async (amount: number) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.id);
    
    const newNotif: Notification = {
      id: Date.now().toString(),
      title: 'Lucky Spin Reward',
      message: `You won ₹${amount} from your daily spin!`,
      type: 'offer',
      date: new Date().toISOString(),
      isRead: false
    };

    await updateDoc(userDocRef, {
      walletBalance: increment(amount),
      lastSpinDate: new Date().toISOString(),
      notifications: arrayUnion(newNotif)
    });
  };


  const addNotification = async (notif: Omit<Notification, 'id' | 'date' | 'isRead'>) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.id);
    const newNotif: Notification = {
      ...notif,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      isRead: false
    };
    await updateDoc(userDocRef, {
      notifications: arrayUnion(newNotif)
    });
  };

  const markNotificationsRead = async () => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.id);
    const updatedNotifications = user.notifications.map(n => ({ ...n, isRead: true }));
    await updateDoc(userDocRef, {
      notifications: updatedNotifications
    });
  };
  
  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.id);
    await updateDoc(userDocRef, data);
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      isLoggedIn: !!user, 
      loading,
      login, 
      logout, 
      addWinnings,
      canSpin,
      recordSpin,
      addNotification,
      markNotificationsRead,
      updateProfile
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

