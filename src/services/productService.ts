import { db, storage } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  where,
  setDoc,
  writeBatch,
  limit,
  startAfter,
  getCountFromServer,
  DocumentSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { Product } from '../types';

/**
 * Product Service - Handles all CRUD operations for jewellery products.
 */
export const productService = {
  /**
   * Fetches all products from Firestore (no orderBy to avoid index issues).
   */
  async getAllProducts(): Promise<Product[]> {
    const productsRef = collection(db, 'products');
    const querySnapshot = await getDocs(productsRef);
    
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));

    // Sort client-side to avoid Firestore composite index requirement
    return products.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  },

  /**
   * Splits a multi-image product into individual products.
   */
  async splitProduct(product: Product): Promise<void> {
    if (!product.images || product.images.length <= 1) return;

    const batch = writeBatch(db);
    
    product.images.forEach((imgUrl, idx) => {
      const newId = `${product.id}-split-${idx}-${Date.now().toString().slice(-4)}`;
      const { id, images, ...rest } = product;
      const newProduct = {
        ...rest,
        name: idx === 0 ? product.name : `${product.name} (${idx + 1})`,
        images: [imgUrl],
        designNo: product.designNo ? `${product.designNo}-${idx + 1}` : '',
      };
      const docRef = doc(db, 'products', newId);
      batch.set(docRef, newProduct);
    });

    // Delete original multi-image product
    const origRef = doc(db, 'products', product.id);
    batch.delete(origRef);

    await batch.commit();
  },

  /**
   * Paginated product fetch — loads products in small batches.
   */
  async getProductsPaginated(
    pageSize: number = 24,
    lastDoc?: DocumentSnapshot | null,
    categoryFilter?: string
  ): Promise<{ products: Product[]; lastDoc: DocumentSnapshot | null; hasMore: boolean }> {
    const productsRef = collection(db, 'products');
    const constraints: any[] = [];

    if (categoryFilter) {
      constraints.push(where('category', '==', categoryFilter));
    }
    // Use __name__ ordering (always indexed, no composite needed)
    constraints.push(orderBy('__name__'));
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }
    constraints.push(limit(pageSize + 1)); // fetch 1 extra to check hasMore

    const q = query(productsRef, ...constraints);
    const snap = await getDocs(q);
    const docs = snap.docs;
    const hasMore = docs.length > pageSize;
    const pageDocs = hasMore ? docs.slice(0, pageSize) : docs;

    return {
      products: pageDocs.map(d => ({ id: d.id, ...d.data() } as Product)),
      lastDoc: pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null,
      hasMore
    };
  },

  /**
   * Get total product count (fast, doesn't download docs).
   */
  async getProductCount(categoryFilter?: string): Promise<number> {
    const productsRef = collection(db, 'products');
    const constraints: any[] = [];
    if (categoryFilter) {
      constraints.push(where('category', '==', categoryFilter));
    }
    const q = query(productsRef, ...constraints);
    const snap = await getCountFromServer(q);
    return snap.data().count;
  },

  /**
   * Get only featured products (for homepage — avoids loading everything).
   */
  async getFeaturedProducts(count: number = 8): Promise<Product[]> {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('featured', '==', true), limit(count));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
  },

  /**
   * Fetches a single product by ID from Firestore.
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      // 1. Try by Document ID directly (Fastest)
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
      }

      // 2. Fallback: Query by designNo field
      const q = query(collection(db, 'products'), where('designNo', '==', id));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        const d = querySnap.docs[0];
        return { id: d.id, ...d.data() } as Product;
      }
    } catch (error) {
      console.error("Firestore getProductById error:", error);
    }
    return null;
  },

  /**
   * Adds a new product or updates an existing one.
   */
  async saveProduct(product: Product): Promise<string> {
    const { id, ...data } = product;
    // Remove undefined values which Firestore doesn't allow
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );
    const productDocRef = doc(db, 'products', id);
    await setDoc(productDocRef, cleanData, { merge: true });
    return id;
  },

  /**
   * Bulk upload products using Firestore batches.
   */
  async bulkUpload(products: Product[]): Promise<void> {
    const batch = writeBatch(db);
    products.forEach(product => {
      const { id, ...data } = product;
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      );
      const docRef = doc(db, 'products', id || Date.now().toString() + Math.random().toString(36).substr(2, 5));
      batch.set(docRef, cleanData, { merge: true });
    });
    await batch.commit();
  },

  /**
   * Deletes an image from Firebase Storage.
   */
  async deleteImage(url: string): Promise<void> {
    if (!url || url.includes('unsplash.com')) return; // Don't try to delete external placeholders
    try {
      const storageRef = ref(storage, url);
      await deleteObject(storageRef);
    } catch (error) {
      console.error("Storage delete error (might already be gone):", error);
    }
  },

  /**
   * Upload an image to Firebase Storage.
   */
  async uploadImage(file: File, folder: string = 'products'): Promise<string> {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  },

  /**
   * Deletes a product.
   */
  async deleteProduct(id: string): Promise<void> {
    const productDocRef = doc(db, 'products', id);
    await deleteDoc(productDocRef);
  },

  /**
   * Deletes all products from Firestore.
   */
  async deleteAllProducts(): Promise<void> {
    const productsRef = collection(db, 'products');
    const querySnapshot = await getDocs(productsRef);
    
    const batch = writeBatch(db);
    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  },

  /**
   * Scans Storage 'products' folder and creates Firestore records for missing items.
   * @param granular If true, treats each image as a separate product.
   * @param defaultCategory The category to assign to new products.
   */
  async syncStorageWithFirestore(granular: boolean = false, defaultCategory: string = 'rings'): Promise<number> {
    const rootRef = ref(storage, 'products');
    let count = 0;

    const processFolder = async (folderRef: any) => {
      const res = await listAll(folderRef);
      
      const imageFiles = res.items.filter(item => 
        item.name.match(/\.(jpg|jpeg|png|webp)$/i)
      );

      if (imageFiles.length > 0) {
        if (granular) {
          // Treat each image as a separate product
          for (const item of imageFiles) {
            const productCode = item.name.split('.')[0]; // Use filename as code
            const productsRef = collection(db, 'products');
            const querySnapshot = await getDocs(productsRef);
            const exists = querySnapshot.docs.some(doc => doc.data().designNo === productCode || doc.id === productCode);

            if (!exists) {
              const url = await getDownloadURL(item);
              const lowerName = productCode.toLowerCase();
              let finalCategory = defaultCategory;

              // Smart Category Detection from filename
              if (lowerName.includes('nath') || lowerName.includes('nose')) finalCategory = 'nose-jewelry';
              else if (lowerName.includes('ring')) finalCategory = 'rings';
              else if (lowerName.includes('bali') || lowerName.includes('top') || lowerName.includes('earring')) finalCategory = 'earrings';
              else if (lowerName.includes('bracelet')) finalCategory = 'bracelets';
              else if (lowerName.includes('pendant')) finalCategory = 'pendants';
              else if (lowerName.includes('mangalsutra')) finalCategory = 'mangalsutra';
              else if (lowerName.includes('bangle')) finalCategory = 'bangles';
              else if (lowerName.includes('coin')) finalCategory = 'coins';
              else if (lowerName.includes('necklace') || lowerName.includes('chain')) finalCategory = 'necklaces';

              const productData: any = {
                name: productCode,
                designNo: productCode,
                price: 0,
                category: finalCategory,
                material: 'gold',
                description: `Imported from Storage: ${productCode}`,
                images: [url],
                inStock: true,
                occasion: 'daily',
                rating: 4.5,
                reviews: 0,
                createdAt: new Date().toISOString()
              };
              await setDoc(doc(db, 'products', productCode), productData);
              count++;
            }
          }
        } else {
          // Group all images in folder as one product
          const productCode = folderRef.name;
          const productsRef = collection(db, 'products');
          const querySnapshot = await getDocs(productsRef);
          const exists = querySnapshot.docs.some(doc => doc.data().designNo === productCode || doc.id === productCode);

          if (!exists) {
            const imageUrls = await Promise.all(imageFiles.map(item => getDownloadURL(item)));
            const productData: any = {
              name: productCode,
              designNo: productCode,
              price: 0,
              category: defaultCategory,
              material: 'gold',
              description: `Imported from Storage: ${productCode}`,
              images: imageUrls,
              inStock: true,
              occasion: 'daily',
              rating: 4.5,
              reviews: 0,
              createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'products', productCode), productData);
            count++;
          }
        }
      }

      for (const subfolder of res.prefixes) {
        await processFolder(subfolder);
      }
    };

    await processFolder(rootRef);
    return count;
  },

  /**
   * Lists items and prefixes (folders) in a specific Storage path.
   */
  async listStorageItems(path: string = 'products') {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    
    const folders = result.prefixes.map(prefix => ({
      name: prefix.name,
      fullPath: prefix.fullPath,
      type: 'folder'
    }));

    const files = await Promise.all(result.items.map(async item => {
      const url = await getDownloadURL(item);
      return {
        name: item.name,
        fullPath: item.fullPath,
        url,
        type: 'file'
      };
    }));

    return { folders, files };
  }
};

