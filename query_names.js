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

async function run() {
  console.log("Fetching products to scan names...");
  const snap = await getDocs(collection(db, 'products'));
  
  const results = [];
  snap.forEach(doc => {
    const data = doc.data();
    const name = data.name || '';
    const category = data.category || '';
    const gender = data.gender || '';
    
    // Check if name contains 'man', 'woman' (not mangalsutra)
    const hasMan = /\bman\b/i.test(name) || name.toLowerCase().includes('man ') || name.toLowerCase().includes(' man');
    const hasWoman = /\bwoman\b/i.test(name) || name.toLowerCase().includes('woman ') || name.toLowerCase().includes(' woman');
    
    if (hasMan || hasWoman) {
      results.push({
        id: doc.id,
        name,
        category,
        gender,
        designNo: data.designNo
      });
    }
  });

  console.log(`Found ${results.length} products:`);
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

run().catch(console.error);
