import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAMn8lbfWx2TxfoqGQIq8LsCkkgJdwBRQo",
  authDomain: "arham-ornaments-ee5f3",
  projectId: "arham-ornaments-ee5f3",
  storageBucket: "arham-ornaments-ee5f3.firebasestorage.app",
  messagingSenderId: "800807427205",
  appId: "1:800807427205:web:69b45a18cee92bb3c79dec",
  measurementId: "G-TLLKXNSW7Y"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// In Firebase Client SDK, we can't easily list collections directly without server SDK,
// but we can query some known ones like 'products', 'users', 'settings', 'categories', 'rates', 'audit_logs', etc.
async function run() {
  const collections = ['products', 'users', 'settings', 'rates', 'audit_logs', 'categories', 'coupons'];
  for (const colName of collections) {
    try {
      const snap = await getDocs(collection(db, colName));
      console.log(`Collection '${colName}': ${snap.size} documents`);
      if (snap.size > 0 && colName !== 'products' && colName !== 'users' && colName !== 'audit_logs') {
        snap.forEach(doc => {
          console.log(`  - Document ID: ${doc.id}`);
          console.log(`    Data:`, JSON.stringify(doc.data(), null, 2));
        });
      }
    } catch (err) {
      console.error(`Error fetching collection '${colName}':`, err.message);
    }
  }
  process.exit(0);
}

run().catch(console.error);
