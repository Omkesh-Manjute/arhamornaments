import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface HomeCategory {
  name: string;
  image: string;
  path: string;
}

export interface HomeCollectionItem {
  id: string;
  name: string;
  image: string;
  path: string;
}

/**
 * Homepage Section Configuration stored in Firestore.
 * Allows admin to select which products and categories go in which homepage section.
 */
export interface HomePromoSection {
  image: string;
  title: string;
  subtitle: string;
  link: string;
  type?: 'left' | 'middle' | 'right';
}

export interface HomeSpotlightConfig {
  image: string;
  title: string;
  subtitle: string;
  link: string;
}

export interface HomepageSectionConfig {
  /** Product IDs for the "New Arrivals" section */
  newArrivals: string[];
  /** Product IDs for the "Best Sellers" section */
  bestSellers: string[];
  /** Product IDs for the "Trending" section */
  trending: string[];
  /** Featured categories */
  categories: HomeCategory[];
  /** Collection items (e.g. for the earring slider) */
  collections: HomeCollectionItem[];
  /** Hero Slider Banners */
  heroBanners?: any[];
  /** Occasion sections */
  occasions?: any[];
  /** Gender-based sections */
  genderSections?: any[];
  /** Heritage Hero section */
  heritageHero?: any;
  /** Best Seller Banner Image */
  bestSellerBanner?: string;
  /** Promotional Split Sections */
  promoSections?: HomePromoSection[];
  /** Featured Spotlight Config */
  spotlight?: HomeSpotlightConfig;
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
    return { 
      newArrivals: [], 
      bestSellers: [], 
      trending: [], 
      categories: [], 
      collections: [],
      heroBanners: [],
      occasions: [],
      genderSections: [],
      bestSellerBanner: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200",
      promoSections: [
        {
          image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200",
          title: "Essence of Pure Artistry",
          subtitle: "New Arrivals",
          link: "/products",
          type: "left"
        },
        {
          image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200",
          title: "Timeless Bridal Splendor",
          subtitle: "Wedding Special",
          link: "/products",
          type: "middle"
        },
        {
          image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=1200",
          title: "Signature Collections",
          subtitle: "Exquisite",
          link: "/products",
          type: "right"
        }
      ],
      spotlight: {
        image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
        title: "Masterpiece",
        subtitle: "Limited Edition 2024",
        link: "/about"
      }
    };
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
