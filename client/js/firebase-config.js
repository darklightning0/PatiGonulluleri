// js/firebase-config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration (get from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyC89BdO9WqMc5ZXiqjoC652Lyy8-vsXZNo",
  authDomain: "patigonulluleri-1193e.firebaseapp.com",
  projectId: "patigonulluleri-1193e",
  storageBucket: "patigonulluleri-1193e.firebasestorage.app",
  messagingSenderId: "294256902955",
  appId: "1:294256902955:web:02435821978b5c0744bb6e",
  measurementId: "G-J5TJC0NYHW"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
export const db = getFirestore(app);

// Collection names
export const COLLECTIONS = {
  PETS: 'pets',
  ARTICLES: 'articles',
  SUBSCRIPTIONS: 'subscriptions'
};