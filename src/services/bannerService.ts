import { db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Banner } from '../types';

export const bannerService = {
  async getAllBanners(): Promise<Banner[]> {
    const ref = collection(db, 'banners');
    const q = query(ref, orderBy('order'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
  },

  async saveBanner(banner: Banner): Promise<void> {
    const ref = doc(db, 'banners', banner.id || Date.now().toString());
    await setDoc(ref, banner, { merge: true });
  },

  async deleteBanner(id: string): Promise<void> {
    await deleteDoc(doc(db, 'banners', id));
  }
};
