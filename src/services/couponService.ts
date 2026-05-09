import { db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { Coupon } from '../types';

export const couponService = {
  async getAllCoupons(): Promise<Coupon[]> {
    const ref = collection(db, 'coupons');
    const snap = await getDocs(ref);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
  },

  async saveCoupon(coupon: Coupon): Promise<void> {
    const ref = doc(db, 'coupons', coupon.id || Date.now().toString());
    await setDoc(ref, coupon, { merge: true });
  },

  async deleteCoupon(id: string): Promise<void> {
    await deleteDoc(doc(db, 'coupons', id));
  }
};
