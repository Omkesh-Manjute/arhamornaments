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
  getDoc
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
    const q = query(usersRef, where('referralCode', '==', code.toUpperCase()));
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
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: 'Referral Bonus! 🎊',
      message: `Your friend ${newUserName} joined using your code. ₹100 has been added to your wallet!`,
      type: 'offer',
      date: new Date().toISOString(),
      isRead: false
    };

    await updateDoc(referrerDocRef, {
      walletBalance: increment(100),
      referralCount: increment(1),
      notifications: arrayUnion(newNotification)
    });
  }
};
