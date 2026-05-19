import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAMn8lbfWx2TxfoqGQIq8LsCkkgJdwBRQo",
  bgName: "arham-ornaments-ee5f3",
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
  console.log("Fetching settings/homepage_sections...");
  const docRef = doc(db, 'settings', 'homepage_sections');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    console.log("homepage_sections data:", JSON.stringify(snap.data(), null, 2));
  } else {
    console.log("homepage_sections document does not exist.");
  }

  console.log("\nFetching all documents in settings collection...");
  const settingsCol = collection(db, 'settings');
  const settingsSnap = await getDocs(settingsCol);
  settingsSnap.forEach(d => {
    console.log(`- ${d.id}:`, JSON.stringify(d.data(), null, 2));
  });

  process.exit(0);
}

run().catch(console.error);
