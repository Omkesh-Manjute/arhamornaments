import { db } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc, arrayUnion, writeBatch } from 'firebase/firestore';
import { Notification } from '../types';

export const notificationService = {
  /**
   * Sends a notification to all users.
   */
  async sendBulkNotification(title: string, message: string, type: Notification['type'] = 'offer'): Promise<void> {
    const usersRef = collection(db, 'users');
    const usersSnap = await getDocs(usersRef);
    
    const batch = writeBatch(db);
    const newNotif: Notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      date: new Date().toISOString(),
      isRead: false
    };

    usersSnap.docs.forEach(userDoc => {
      batch.update(userDoc.ref, {
        notifications: arrayUnion(newNotif)
      });
    });

    await batch.commit();
  },

  /**
   * Sends a notification to a specific user.
   */
  async sendPrivateNotification(userId: string, title: string, message: string, type: Notification['type'] = 'system'): Promise<void> {
    const userDocRef = doc(db, 'users', userId);
    const newNotif: Notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      date: new Date().toISOString(),
      isRead: false
    };

    await updateDoc(userDocRef, {
      notifications: arrayUnion(newNotif)
    });
  }
};
