import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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
  console.log("Fetching homepage config...");
  const docRef = doc(db, 'settings', 'homepage_sections');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    console.log("Homepage Config Data:");
    console.log(JSON.stringify(snap.data(), null, 2));
  } else {
    console.log("No homepage config document found!");
  }
  process.exit(0);
}

run().catch(console.error);
