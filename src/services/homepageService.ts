import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * Homepage Section Configuration stored in Firestore.
 * Allows admin to select which products go in which homepage section.
 */
export interface HomepageSectionConfig {
  /** Product IDs for the "New Arrivals" section */
  newArrivals: string[];
  /** Product IDs for the "Best Sellers" section */
  bestSellers: string[];
  /** Product IDs for the "Trending" section */
  trending: string[];
  /** Last updated timestamp */
  updatedAt?: string;
}

const CONFIG_DOC = 'homepage_sections';
const CONFIG_COLLECTION = 'settings';

export const homepageService = {
  /**
   * Fetch the homepage section configuration from Firestore.
   */
  async getSectionConfig(): Promise<HomepageSectionConfig> {
    try {
      const docRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as HomepageSectionConfig;
      }
    } catch (error) {
      console.error('Failed to fetch homepage config:', error);
    }
    // Default empty config
    return { newArrivals: [], bestSellers: [], trending: [] };
  },

  /**
   * Save the homepage section configuration to Firestore.
   */
  async saveSectionConfig(config: HomepageSectionConfig): Promise<void> {
    const docRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC);
    await setDoc(docRef, {
      ...config,
      updatedAt: new Date().toISOString()
    });
  }
};
