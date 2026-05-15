import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  increment, 
  arrayUnion,
  getDoc,
  addDoc,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { Notification } from '../types';

/**
 * Referral Service - Handles logic for referral codes and bonuses.
 */
export const referralService = {
  /**
   * Validates if a referral code exists.
   * Returns the referrer's user ID if found.
   */
  async validateCode(code: string): Promise<string | null> {
    if (!code || code.trim() === '') return null;
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('referralCode', '==', code.trim().toUpperCase()));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }
    return null;
  },

  /**
   * Applies the referral bonus to the referrer.
   * This is usually called after the new user successfully signs up.
   */
  async creditReferrer(referrerUid: string, newUserName: string) {
    const referrerDocRef = doc(db, 'users', referrerUid);
    const referrerSnap = await getDoc(referrerDocRef);
    
    if (!referrerSnap.exists()) return false;
    
    const referrerData = referrerSnap.data();
    const currentMonth = new Date().toISOString().substring(0, 7); // 'YYYY-MM'
    
    let monthlyCount = referrerData.monthlyReferralCount || 0;
    const lastMonth = referrerData.lastReferralMonth || '';
    
    // Reset count if it's a new month
    if (lastMonth !== currentMonth) {
      monthlyCount = 0;
    }
    
    // Check limit: 10 per month
    if (monthlyCount >= 10) {
      console.log(`Referrer ${referrerUid} has reached the monthly limit of 10 referrals.`);
      return false; // Skip credit
    }

    const newNotification: Notification = {
      id: Date.now().toString(),
      title: 'Referral Bonus! 🎊',
      message: `Your friend ${newUserName} joined using your code. ₹100 has been added to your wallet!`,
      type: 'offer',
      date: new Date().toISOString(),
      isRead: false
    };

    try {
      await updateDoc(referrerDocRef, {
        walletBalance: increment(100),
        referralCount: increment(1),
        monthlyReferralCount: lastMonth === currentMonth ? increment(1) : 1,
        lastReferralMonth: currentMonth,
        notifications: arrayUnion(newNotification)
      });
      return true;
    } catch (err) {
      console.warn("Direct credit failed (likely due to security rules). Falling back to pending referral record.", err);
      // Fallback: Record a pending referral that the referrer can claim later
      await addDoc(collection(db, 'referral_tasks'), {
        referrerUid,
        newUserName,
        amount: 100,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      return false;
    }
  },

  /**
   * Processes any pending referrals for the currently logged in user.
   */
  async processPendingReferrals(userUid: string, onCredit: (amount: number) => void) {
    const tasksRef = collection(db, 'referral_tasks');
    const q = query(tasksRef, where('referrerUid', '==', userUid), where('status', '==', 'pending'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return;

    for (const taskDoc of querySnapshot.docs) {
      const data = taskDoc.data();
      const amount = data.amount || 100;
      
      // Update user's own document (they have permission)
      const userDocRef = doc(db, 'users', userUid);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) continue;
      
      const userData = userSnap.data();
      const currentMonth = new Date().toISOString().substring(0, 7);
      let monthlyCount = userData.monthlyReferralCount || 0;
      if ((userData.lastReferralMonth || '') !== currentMonth) monthlyCount = 0;

      if (monthlyCount >= 10) {
        // Skip this task for now or mark as exceeded
        continue; 
      }

      const newNotification: Notification = {
        id: Date.now().toString(),
        title: 'Referral Bonus! 🎊',
        message: `Your friend ${data.newUserName} joined using your code. ₹${amount} has been added to your wallet!`,
        type: 'offer',
        date: new Date().toISOString(),
        isRead: false
      };

      await updateDoc(userDocRef, {
        walletBalance: increment(amount),
        referralCount: increment(1),
        monthlyReferralCount: (userData.lastReferralMonth || '') === currentMonth ? increment(1) : 1,
        lastReferralMonth: currentMonth,
        notifications: arrayUnion(newNotification)
      });

      // Mark task as completed
      await deleteDoc(taskDoc.ref);
      onCredit(amount);
    }
  }
};
