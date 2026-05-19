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
  console.log("Fetching products...");
  const snap = await getDocs(collection(db, 'products'));
  
  const results = [];
  snap.forEach(doc => {
    const data = doc.data();
    const hasMan = /man/i.test(data.category || '') || /man/i.test(data.gender || '');
    const hasWoman = /woman/i.test(data.category || '') || /woman/i.test(data.gender || '');
    if (hasMan || hasWoman) {
      results.push({
        id: doc.id,
        name: data.name,
        category: data.category,
        gender: data.gender,
        designNo: data.designNo
      });
    }
  });

  console.log(`Found ${results.length} products with 'man' or 'woman':`);
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

run().catch(console.error);
