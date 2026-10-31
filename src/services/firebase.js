import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously as fbSignInAnonymously,
  signInWithEmailAndPassword as fbSignInWithEmail,
  createUserWithEmailAndPassword as fbCreateUserWithEmail,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';

// Default Firebase configuration (or environment variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-block-blast-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "block-blast-portfolio.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "block-blast-portfolio",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "block-blast-portfolio.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1029384756",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1029384756:web:abcdef123456",
};

let app = null;
let auth = null;
let db = null;
let isFirebaseAvailable = false;

try {
  // Only attempt live Firebase connection if key is non-demo and valid
  const hasValidConfig =
    Boolean(firebaseConfig.apiKey) &&
    !firebaseConfig.apiKey.includes('demo') &&
    firebaseConfig.apiKey.length > 20;

  if (hasValidConfig) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseAvailable = true;
  } else {
    // Graceful demo mode indicator
    // eslint-disable-next-line no-console
    console.info('[BlockBlast] Running in Resilient Local Demo Mode (Demo Firebase credentials).');
  }
} catch (error) {
  // eslint-disable-next-line no-console
  console.warn('[BlockBlast] Firebase initialization fallback to local storage:', error.message);
  isFirebaseAvailable = false;
}

export {
  app,
  auth,
  db,
  isFirebaseAvailable,
  fbSignInAnonymously,
  fbSignInWithEmail,
  fbCreateUserWithEmail,
  fbSignOut,
  fbOnAuthStateChanged,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
};
