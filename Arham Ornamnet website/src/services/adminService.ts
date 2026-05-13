import { db } from '../lib/firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  addDoc,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { User, Notification, AuditLog } from '../types';

export const adminService = {
  /**
   * Send notification to multiple users
   */
  async sendMassNotification(
    targetType: 'all' | 'specific',
    notification: Omit<Notification, 'id' | 'date' | 'isRead'>,
    specificUserIds?: string[]
  ) {
    const usersRef = collection(db, 'users');
    let uids: string[] = [];

    if (targetType === 'all') {
      const snapshot = await getDocs(usersRef);
      uids = snapshot.docs.map(doc => doc.id);
    } else if (specificUserIds) {
      uids = specificUserIds;
    }

    const newNotif: Notification = {
      ...notification,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      isRead: false
    };

    const promises = uids.map(uid => {
      const userDocRef = doc(db, 'users', uid);
      return updateDoc(userDocRef, {
        notifications: arrayUnion(newNotif)
      });
    });

    await Promise.all(promises);
    return uids.length;
  },

  /**
   * Create an audit log entry
   */
  async createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const logsRef = collection(db, 'audit_logs');
    await addDoc(logsRef, {
      ...log,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Fetch latest audit logs
   */
  async getAuditLogs(count: number = 50): Promise<AuditLog[]> {
    const logsRef = collection(db, 'audit_logs');
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(count));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AuditLog));
  }
};
