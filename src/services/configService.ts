import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

/**
 * Config Service - Handles global app configuration like gold/silver rates.
 */
export const configService = {
  /**
   * Fetches current metal rates.
   */
  async getRates() {
    const docRef = doc(db, 'metadata', 'rates');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  },

  /**
   * Updates metal rates.
   */
  async updateRates(rates: any) {
    const docRef = doc(db, 'metadata', 'rates');
    await setDoc(docRef, rates, { merge: true });
  },

  /**
   * Listens for real-time rate updates.
   */
  subscribeToRates(callback: (rates: any) => void) {
    const docRef = doc(db, 'metadata', 'rates');
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) callback(doc.data());
    });
  }
};
