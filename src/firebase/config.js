// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCeQiyjpvtAnWT5KdL3EcBkZ2qyw9-IiBg",
  authDomain: "iset-jendouba-3168d.firebaseapp.com",
  projectId: "iset-jendouba-3168d",
  storageBucket: "iset-jendouba-3168d.firebasestorage.app",
  messagingSenderId: "228102829166",
  appId: "1:228102829166:web:6a6a47050ec63019cce27f",
  measurementId: "G-SMLFLTHBTK"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);