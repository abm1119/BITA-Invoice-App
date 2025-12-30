import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy" + Math.random().toString(36).substring(7),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "venbakers-aa59f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "venbakers-aa59f",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://venbakers-aa59f-default-rtdb.asia-southeast1.firebasedatabase.app/",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "975653802966",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:975653802966:web:unknown"
};

// Initialize Firebase modular instances
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
