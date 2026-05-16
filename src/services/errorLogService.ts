import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  updateDoc, 
  doc, 
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { ErrorLog } from '../types';

export const errorLogService = {
  /**
   * Log an error to Firestore
   */
  async logError(error: Partial<ErrorLog>) {
    try {
      const logsRef = collection(db, 'error_logs');
      const logData = {
        message: error.message || 'Unknown Error',
        stack: error.stack || '',
        componentStack: error.componentStack || '',
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: error.userId || 'guest',
        userEmail: error.userEmail || 'anonymous',
        timestamp: new Date().toISOString(),
        severity: error.severity || 'medium',
        status: 'new'
      };

      await addDoc(logsRef, logData);
    } catch (e) {
      // Fallback to console if Firestore logging fails
      console.error('Failed to log error to Firestore:', e);
      console.error('Original error:', error);
    }
  },

  /**
   * Fetch latest error logs for admin
   */
  async getErrorLogs(count: number = 50): Promise<ErrorLog[]> {
    const logsRef = collection(db, 'error_logs');
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(count));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ErrorLog));
  },

  /**
   * Update error status
   */
  async updateErrorStatus(id: string, status: ErrorLog['status']) {
    const logRef = doc(db, 'error_logs', id);
    await updateDoc(logRef, { status });
  },

  /**
   * Delete an error log
   */
  async deleteErrorLog(id: string) {
    const logRef = doc(db, 'error_logs', id);
    await deleteDoc(logRef);
  },

  /**
   * Clear all error logs (Admin only)
   */
  async clearAllLogs() {
    const logsRef = collection(db, 'error_logs');
    const snapshot = await getDocs(logsRef);
    const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  }
};
