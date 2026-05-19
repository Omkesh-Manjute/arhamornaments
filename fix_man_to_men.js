import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

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
const auth = getAuth(app);

async function run() {
  console.log("Authenticating as admin...");
  await signInWithEmailAndPassword(auth, 'admin@arham.com', 'arham786');
  console.log("Authentication successful! Scanning products...");

  const snap = await getDocs(collection(db, 'products'));
  
  let updatedCount = 0;
  for (const document of snap.docs) {
    const data = document.data();
    const name = data.name || '';
    
    let newName = name;
    if (name.startsWith('Man ')) {
      newName = name.replace(/^Man /, 'Men ');
    } else if (name.startsWith('Woman ')) {
      newName = name.replace(/^Woman /, 'Women ');
    }
    
    if (newName !== name) {
      console.log(`Updating product ${document.id}: "${name}" -> "${newName}"`);
      const docRef = doc(db, 'products', document.id);
      await updateDoc(docRef, { name: newName });
      updatedCount++;
    }
  }

  console.log(`Successfully updated ${updatedCount} products in the database!`);
  process.exit(0);
}

run().catch(console.error);
