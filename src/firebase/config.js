import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBuufYBxJOl1QsrNA3hiZQJWUllEvB4vVs",
  authDomain: "neighbornet-57018.firebaseapp.com",
  projectId: "neighbornet-57018",
  storageBucket: "neighbornet-57018.firebasestorage.app",
  messagingSenderId: "787592606949",
  appId: "1:787592606949:web:270f40261ef9684efc100c",
  measurementId: "G-LLMTJQ5HVL"
};

const app = initializeApp(firebaseConfig);

// Export services for use throughout the app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);