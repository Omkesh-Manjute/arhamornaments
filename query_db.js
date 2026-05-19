import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAMn8lbfWx2TxfoqGQIq8LsCkkgJdwBRQo",
  authDomain: "arham-ornaments-ee5f3.firebaseapp.com",
  projectId: "arham-ornaments-ee5f3",
  storageBucket: "arham-ornaments-ee5f3.firebasestorage.app",
  messagingSenderId: "800807427205",
  appId: "1:800807427205:web:69b45a18cee92bb3c79dec",
  measurementId: "G-TLLKXNSW7Y"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log("Fetching all products...");
  const colRef = collection(db, 'products');
  const snap = await getDocs(colRef);
  console.log(`Total products: ${snap.size}`);

  const genders = new Set();
  const categories = new Set();
  const manProducts = [];

  snap.forEach(doc => {
    const data = doc.data();
    if (data.gender) genders.add(data.gender);
    if (data.category) categories.add(data.category);
    
    // Check if gender or category has 'man' or 'man '
    if (data.gender === 'man' || data.category === 'man' || String(data.gender).toLowerCase().trim() === 'man') {
      manProducts.push({ id: doc.id, name: data.name, gender: data.gender, category: data.category });
    }
  });

  console.log("Unique Genders:", Array.from(genders));
  console.log("Unique Categories:", Array.from(categories));
  console.log(`Products with 'man':`, JSON.stringify(manProducts, null, 2));

  process.exit(0);
}

run().catch(console.error);
