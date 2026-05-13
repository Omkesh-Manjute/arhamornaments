import { db } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  doc,
  updateDoc
} from 'firebase/firestore';
import { User } from '../types';

/**
 * User Service - Handles customer data management for the Admin.
 */
export const userService = {
  /**
   * Fetches all registered customers.
   */
  async getAllUsers(): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('joinedDate', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as User));
  },

  /**
   * Updates a user's wallet or tier (Admin function).
   */
  async updateUserProfile(uid: string, data: Partial<User>) {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, data);
  }
};
